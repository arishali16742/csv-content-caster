import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

interface SpreadsheetUploadProps {
  onDataParsed: (data: any[]) => void;
  title: string;
  templateData?: any[];
}

const SpreadsheetUploadVisaPricing = ({ onDataParsed, title, templateData }: SpreadsheetUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const expectedColumns = [
    'origin_country', 
    'destination_country', 
    'price_15_days', 
    'price_30_days', 
    'price_yearly',
    'status'
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateCSVContent = () => {
    const headers = expectedColumns.join(',');
    
    if (templateData && templateData.length > 0) {
      const rows = templateData.slice(0, 3).map(item => {
        return expectedColumns.map(col => {
          let value = item[col] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });
      return headers + '\n' + rows.join('\n');
    } else {
      const exampleRow = [
        'India',
        'United States',
        '15000',
        '25000',
        '80000',
        'active'
      ].join(',');
      return headers + '\n' + exampleRow;
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
  
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    
    const parseLine = (line: string) => {
      const result = [];
      let inQuotes = false;
      let currentField = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === delimiter && !inQuotes) {
          result.push(currentField);
          currentField = '';
        } else currentField += char;
      }
      result.push(currentField);
      return result;
    };
  
    const headers = parseLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map((row, index) => {
      const values = parseLine(row).map(v => v.trim().replace(/""/g, '"'));
      const obj: any = {};
      
      headers.forEach((header, headerIndex) => {
        let value = values[headerIndex] || '';
        value = value.trim();
        
        if (header.startsWith('price_')) {
          const numericValue = value.replace(/[^0-9.]/g, '');
          obj[header] = numericValue ? Math.round(parseFloat(numericValue)) : 0;
        } else {
          obj[header] = value;
        }
      });
      
      if (!obj.status) obj.status = 'active';
      return obj;
    }).filter(obj => obj.origin_country && obj.destination_country);
  };

  const validateData = (data: any[]) => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      if (!row.origin_country?.trim()) errors.push(`Row ${index + 1}: Origin country is required`);
      if (!row.destination_country?.trim()) errors.push(`Row ${index + 1}: Destination country is required`);
      
      ['price_15_days', 'price_30_days', 'price_yearly'].forEach(field => {
        if (isNaN(row[field])) errors.push(`Row ${index + 1}: Invalid ${field.replace('_', ' ')} value`);
      });
      
      if (row.status && !['active', 'inactive'].includes(row.status.toLowerCase())) {
        errors.push(`Row ${index + 1}: Status must be either "active" or "inactive"`);
      }
    });
    
    return errors;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No File", description: "Please select a CSV file", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast({ title: "Empty File", description: "No valid data found", variant: "destructive" });
        return;
      }

      const missingColumns = expectedColumns.filter(col => 
        !Object.keys(data[0]).includes(col) && col !== 'status'
      );
      
      if (missingColumns.length > 0) {
        toast({ 
          title: "Invalid Format", 
          description: `Missing columns: ${missingColumns.join(', ')}`, 
          variant: "destructive" 
        });
        return;
      }

      const validationErrors = validateData(data);
      if (validationErrors.length > 0) {
        toast({ 
          title: "Validation Failed", 
          description: `${validationErrors.length} errors found`, 
          variant: "destructive" 
        });
        return;
      }

      onDataParsed(data);
      toast({ title: "Success", description: `${data.length} entries parsed` });
      
      setFile(null);
      const input = document.getElementById('csv-upload') as HTMLInputElement;
      if (input) input.value = '';
      
    } catch (error) {
      toast({ title: "Error", description: "Failed to process file", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">{title}</h4>
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="flex items-center gap-2">
          <Download size={16} /> Download Template
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Expected columns: {expectedColumns.join(', ')}</p>
          <p className="text-sm text-yellow-600 mb-2">
            ⚠️ Important: 
            <ul className="list-disc pl-5 mt-1">
              <li>Price fields must contain only numbers</li>
              <li>Status must be "active" or "inactive"</li>
              <li>Countries are required</li>
            </ul>
          </p>
          <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="bg-white" />
        </div>
        
        {file && <div className="text-sm text-gray-600">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</div>}
        
        <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
          {loading ? 'Processing...' : 'Upload & Parse CSV'}
        </Button>
      </div>
    </div>
  );
};

export default SpreadsheetUploadVisaPricing;