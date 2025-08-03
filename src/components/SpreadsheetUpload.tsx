import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

interface SpreadsheetUploadProps {
  onDataParsed: (data: any[]) => void;
  expectedColumns: string[];
  title: string;
  templateData?: any[];
}

const SpreadsheetUpload = ({ onDataParsed, expectedColumns, title, templateData }: SpreadsheetUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          if (Array.isArray(value)) {
            value = value.join(';');
          }
          // Escape quotes and wrap in quotes if contains comma or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });
      return headers + '\n' + rows.join('\n');
    } else {
      // Generate example row based on column names
      const exampleRow = expectedColumns.map(col => {
        switch (col) {
          case 'title':
          case 'name':
            return 'Example Destination';
          case 'country':
            return 'India';
          case 'destinations':
            return 'Delhi;Mumbai;Goa';
          case 'description':
            return 'Beautiful destination with amazing views';
          case 'duration':
            return '7 Days 6 Nights';
          case 'price':
            return '45000';
          case 'original_price':
          case 'old_price':
            return '55000';
          case 'rating':
            return '4.5';
          case 'image':
            return 'https://example.com/image.jpg';
          case 'gallery_images':
            return 'https://example.com/image1.jpg;https://example.com/image2.jpg;https://example.com/image3.jpg;https://example.com/image4.jpg;https://example.com/image5.jpg;https://example.com/image6.jpg';
          case 'includes':
            return 'Flights;Hotels;Meals';
          case 'mood':
            return 'Adventure';
          case 'trip_type':
            return 'Family';
          case 'discount':
            return '20% OFF';
          default:
            return '';
        }
      }).join(',');
      return headers + '\n' + exampleRow;
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
  
    // Detect delimiter (comma or tab)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    console.log('Detected delimiter:', delimiter === '\t' ? 'tab' : 'comma');
  
    // Improved CSV parsing that handles quoted fields with commas
    const parseCSVLine = (line: string) => {
      const result = [];
      let inQuotes = false;
      let currentField = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          // Toggle quote state
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          // Add completed field to result
          result.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      
      // Add the last field
      result.push(currentField);
      return result;
    };
  
    const headers = parseCSVLine(firstLine).map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
  
    console.log('Headers found:', headers);
  
    return rows.map((row, index) => {
      const values = parseCSVLine(row).map(v => v.trim().replace(/""/g, '"')); // Replace double quotes with single
      const obj: any = {};
      
      headers.forEach((header, headerIndex) => {
        let value = values[headerIndex] || '';
        
        // Clean up the value
        value = value.trim();
        
        // Handle specific data type conversions
        if (['price', 'old_price'].includes(header)) {
          // Remove any non-numeric characters except decimal point
          const numericValue = value.replace(/[^0-9.]/g, '');
          obj[header] = numericValue ? Math.round(parseFloat(numericValue)) : 0;
        } else if (header === 'rating') {
          // Keep rating as decimal but ensure it's a valid number
          const numericValue = value.replace(/[^0-9.]/g, '');
          obj[header] = numericValue ? parseFloat(numericValue) : 5.0;
        } else {
          obj[header] = value;
        }
      });
      
      console.log(`Row ${index + 1}:`, obj);
      return obj;
    }).filter(obj => {
      // Filter out rows that have empty names or are completely empty
      return obj.name && obj.name.trim() !== '';
    });
  };

  const validateData = (data: any[]) => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      // Check required fields
      if (!row.name || row.name.trim() === '') {
        errors.push(`Row ${index + 1}: Name is required`);
      }
      
      // Validate numeric fields
      if (isNaN(row.price) || row.price < 0) {
        errors.push(`Row ${index + 1}: Invalid price value`);
      }
      
      if (isNaN(row.old_price) || row.old_price < 0) {
        errors.push(`Row ${index + 1}: Invalid old_price value`);
      }
      
      if (isNaN(row.rating) || row.rating < 0 || row.rating > 5) {
        errors.push(`Row ${index + 1}: Rating must be between 0 and 5`);
      }
      
      // Validate image URL if provided
      if (row.image && row.image.trim() !== '' && !row.image.startsWith('http')) {
        errors.push(`Row ${index + 1}: Image must be a valid URL starting with http`);
      }
    });
    
    return errors;
  };

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
      console.log('Raw file content:', text.substring(0, 500) + '...');
      
      const data = parseCSV(text);
      console.log('Parsed data:', data);
      
      if (data.length === 0) {
        toast({
          title: "Empty File",
          description: "The uploaded file appears to be empty or has no valid rows",
          variant: "destructive",
        });
        return;
      }

      // Validate columns
      const fileColumns = Object.keys(data[0]);
      const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
      
      if (missingColumns.length > 0) {
        toast({
          title: "Invalid Format",
          description: `Missing columns: ${missingColumns.join(', ')}. Expected: ${expectedColumns.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Validate data
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

      onDataParsed(data);
      toast({
        title: "Success",
        description: `${data.length} rows parsed successfully`,
      });
      
      setFile(null);
      // Reset the input
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
            ⚠️ Important: Ensure all price fields contain only numbers (no decimal points for price/old_price), 
            rating can have decimals (0-5), and all required fields are filled.
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
          {loading ? 'Processing...' : 'Upload & Parse CSV'}
        </Button>
      </div>
    </div>
  );
};

export default SpreadsheetUpload;