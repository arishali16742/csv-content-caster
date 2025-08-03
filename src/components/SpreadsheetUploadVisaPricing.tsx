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

const SpreadsheetUploadVisaInfo = ({ onDataParsed, title, templateData }: SpreadsheetUploadProps) => {
  // State for selected file and loading status
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Define the expected columns for visa image uploads
  const expectedColumns = ['title_line', 'name', 'image', 'price', 'status'];

  // Handle file selection
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

  // Download CSV template function
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

  // Generate CSV content for the template
  const generateCSVContent = () => {
    const headers = expectedColumns.join(',');
    
    if (templateData && templateData.length > 0) {
      // Use provided template data if available
      const rows = templateData.slice(0, 3).map(item => {
        return expectedColumns.map(col => {
          let value = item[col] || '';
          if (Array.isArray(value)) {
            value = value.join(';');
          }
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });
      return headers + '\n' + rows.join('\n');
    } else {
      // Generate example data if no template provided
      const exampleRow = expectedColumns.map(col => {
        switch (col) {
          case 'title_line':
            return 'Premium Visa Service';
          case 'name':
            return 'USA Tourist Visa';
          case 'image':
            return 'https://example.com/visa.jpg';
          case 'price':
            return '19900'; // Price in INR
          case 'status':
            return 'active';
          default:
            return '';
        }
      }).join(',');
      return headers + '\n' + exampleRow;
    }
  };

  // Parse uploaded CSV file
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
  
    // Detect delimiter (comma or tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    // Parse each line considering quoted fields
    const parseCSVLine = (line: string) => {
      const result = [];
      let inQuotes = false;
      let currentField = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      
      result.push(currentField);
      return result;
    };
  
    // Extract headers and clean them
    const headers = parseCSVLine(firstLine).map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
  
    // Process each row into an object
    return rows.map((row, index) => {
      const values = parseCSVLine(row).map(v => v.trim().replace(/""/g, '"'));
      const obj: any = {};
      
      // Map each value to its header
      headers.forEach((header, headerIndex) => {
        let value = values[headerIndex] || '';
        value = value.trim();
        
        // Special handling for price field
        if (header === 'price') {
          const numericValue = value.replace(/[^0-9.]/g, '');
          obj[header] = numericValue ? Math.round(parseFloat(numericValue)) : 0;
        } else {
          obj[header] = value;
        }
      });
      
      // Set default status if not provided
      if (!obj.status) {
        obj.status = 'active';
      }
      
      return obj;
    }).filter(obj => {
      // Filter out empty rows
      return obj.name && obj.name.trim() !== '';
    });
  };

  // Validate parsed data
  const validateData = (data: any[]) => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      // Check required fields
      if (!row.name || row.name.trim() === '') {
        errors.push(`Row ${index + 1}: Name is required`);
      }
      
      // Validate price
      if (isNaN(row.price) || row.price < 0) {
        errors.push(`Row ${index + 1}: Invalid price value`);
      }
      
      // Validate image URL format
      if (row.image && row.image.trim() !== '' && !row.image.startsWith('http')) {
        errors.push(`Row ${index + 1}: Image must be a valid URL starting with http`);
      }
      
      // Validate status values
      if (row.status && !['active', 'inactive'].includes(row.status.toLowerCase())) {
        errors.push(`Row ${index + 1}: Status must be either "active" or "inactive"`);
      }
    });
    
    return errors;
  };

  // Handle file upload and processing
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast({
          title: "Empty File",
          description: "The uploaded file appears to be empty or has no valid rows",
          variant: "destructive",
        });
        return;
      }

      // Check for missing required columns (status is optional)
      const fileColumns = Object.keys(data[0]);
      const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col) && col !== 'status');
      
      if (missingColumns.length > 0) {
        toast({
          title: "Invalid Format",
          description: `Missing columns: ${missingColumns.join(', ')}. Expected: ${expectedColumns.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Validate data content
      const validationErrors = validateData(data);
      if (validationErrors.length > 0) {
        toast({
          title: "Data Validation Failed",
          description: `${validationErrors.length} errors found. Check console for details.`,
          variant: "destructive",
        });
        console.error('Validation errors:', validationErrors);
        return;
      }

      // Success - pass data to parent component
      onDataParsed(data);
      toast({
        title: "Success",
        description: `${data.length} visa products parsed successfully`,
      });
      
      // Reset file input
      setFile(null);
      const input = document.getElementById('csv-upload') as HTMLInputElement;
      if (input) input.value = '';
      
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Error",
        description: "Failed to parse the CSV file. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Component rendering
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">{title}</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Download Template
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Expected columns: {expectedColumns.join(', ')}
          </p>
          <p className="text-sm text-yellow-600 mb-2">
            ⚠️ Important: 
            <ul className="list-disc pl-5 mt-1">
              <li>Price must contain only numbers (no currency symbols)</li>
              <li>Status must be either "active" or "inactive" (defaults to active)</li>
              <li>Image must be a valid URL starting with http/https</li>
              <li>Name is required for all entries</li>
            </ul>
          </p>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="bg-white"
          />
        </div>
        
        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? 'Processing Visa Data...' : 'Upload & Parse Visa CSV'}
        </Button>
      </div>
    </div>
  );
};

export default SpreadsheetUploadVisaInfo;