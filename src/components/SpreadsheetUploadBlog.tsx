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

const SpreadsheetUploadBlog = ({ onDataParsed, title, templateData }: SpreadsheetUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const expectedColumns = [
    'title',
    'content',
    'excerpt',
    'image',
    'author',
    'published',
    'position',
    'category',
    'editor_name',
    'date_written',
    'show_on_homepage',
    'additional_images',
    'price',
    'itinerary',
    'author_image'
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
      const exampleRow = expectedColumns.map(col => {
        switch (col) {
          case 'title':
            return 'Sample Blog Post';
          case 'content':
            return 'This is the main content of the blog post...';
          case 'excerpt':
            return 'Short description of the blog post';
          case 'image':
            return 'https://example.com/blog-image.jpg';
          case 'author':
            return 'John Doe';
          case 'published':
            return 'true';
          case 'position':
            return '1';
          case 'category':
            return 'Travel';
          case 'editor_name':
            return 'Jane Smith';
          case 'date_written':
            return '2023-01-01';
          case 'show_on_homepage':
            return 'true';
          case 'additional_images':
            return 'https://example.com/image1.jpg;https://example.com/image2.jpg';
          case 'price':
            return '19900';
          case 'itinerary':
            return 'Day 1: Arrival;Day 2: Sightseeing';
          case 'author_image':
            return 'https://example.com/author.jpg';
          default:
            return '';
        }
      }).join(',');
      return headers + '\n' + exampleRow;
    }
  };

  const parseDate = (dateString: string): string => {
    if (!dateString) return '';
    
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        let year = parts[2];
        
        if (year.length === 2) {
          year = `20${year}`;
        }
        
        return `${year}-${month}-${day}`;
      }
    }
    
    return dateString;
  };

  const parseAdditionalImages = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(';')
        .map(img => img.trim())
        .filter(img => img !== '');
    }
    return [];
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
  
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
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
  
    const headers = parseCSVLine(firstLine).map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
  
    return rows.map((row, index) => {
      const values = parseCSVLine(row).map(v => v.trim().replace(/""/g, '"'));
      const obj: any = {};
      
      headers.forEach((header, headerIndex) => {
        let value = values[headerIndex] || '';
        value = value.trim();
        
        if (header === 'price') {
          const numericValue = value.replace(/[^0-9.]/g, '');
          obj[header] = numericValue ? Math.round(parseFloat(numericValue)) : 0;
        } else if (header === 'published' || header === 'show_on_homepage') {
          obj[header] = value.toLowerCase() === 'true';
        } else if (header === 'position') {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'additional_images') {
          obj[header] = parseAdditionalImages(value);
        } else if (header === 'date_written') {
          obj[header] = parseDate(value);
        } else {
          obj[header] = value;
        }
      });
      
      if (!obj.published) {
        obj.published = false;
      }
      
      return obj;
    }).filter(obj => {
      return obj.title && obj.title.trim() !== '';
    });
  };

  const validateData = (data: any[]) => {
    const errors: string[] = [];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    data.forEach((row, index) => {
      if (!row.title || row.title.trim() === '') {
        errors.push(`Row ${index + 1}: Title is required`);
      }
      
      if (row.image && row.image.trim() !== '' && !row.image.startsWith('http')) {
        errors.push(`Row ${index + 1}: Image must be a valid URL starting with http`);
      }
      
      if (row.author_image && row.author_image.trim() !== '' && !row.author_image.startsWith('http')) {
        errors.push(`Row ${index + 1}: Author image must be a valid URL starting with http`);
      }
      
      if (row.price && isNaN(row.price)) {
        errors.push(`Row ${index + 1}: Invalid price value`);
      }
      
      if (row.date_written && row.date_written.trim() !== '' && !dateRegex.test(row.date_written)) {
        errors.push(`Row ${index + 1}: Date written must be in YYYY-MM-DD format (found "${row.date_written}")`);
      }

      if (row.additional_images && !Array.isArray(row.additional_images)) {
        errors.push(`Row ${index + 1}: Additional images must be a semicolon-separated string`);
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
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast({
          title: "Empty File",
          description: "The uploaded file appears to be empty or has no valid rows",
          variant: "destructive",
        });
        return;
      }

      const fileColumns = Object.keys(data[0]);
      const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col) && 
        !['published', 'show_on_homepage', 'position', 'additional_images', 'author_image'].includes(col));
      
      if (missingColumns.length > 0) {
        toast({
          title: "Invalid Format",
          description: `Missing required columns: ${missingColumns.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

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

      // Ensure additional_images is properly formatted before passing to parent
      const processedData = data.map(item => ({
        ...item,
        additional_images: Array.isArray(item.additional_images) 
          ? item.additional_images 
          : parseAdditionalImages(item.additional_images)
      }));

      onDataParsed(processedData);
      toast({
        title: "Success",
        description: `${data.length} blog posts parsed successfully`,
      });
      
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
              <li>Title and content are required fields</li>
              <li>Published and show_on_homepage should be "true" or "false"</li>
              <li>Date can be in MM/DD/YY or YYYY-MM-DD format</li>
              <li>Additional images should be separated by semicolons (;)</li>
              <li>Image URLs must start with http/https</li>
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
          {loading ? 'Processing Blog Data...' : 'Upload & Parse Blog CSV'}
        </Button>
      </div>
    </div>
  );
};

export default SpreadsheetUploadBlog;