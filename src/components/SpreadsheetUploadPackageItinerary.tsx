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
  selectedPackageId?: string;
  packages?: any[];
}

const SpreadsheetUploadIt = ({ 
  onDataParsed, 
  expectedColumns, 
  title, 
  templateData,
  selectedPackageId,
  packages = []
}: SpreadsheetUploadProps) => {
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
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });
      return headers + '\n' + rows.join('\n');
    } else {
      // Generate example row for itinerary management
      const exampleRow = expectedColumns.map(col => {
        switch (col) {
          case 'package_id':
            return selectedPackageId || (packages.length > 0 ? packages[0].id : 'pkg_001');
          case 'package_title':
            return packages.length > 0 ? packages[0].title : 'Example Package';
          case 'title':
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
          case 'hero_image':
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
          case 'attractions':
            return 'Red Fort;India Gate;Taj Mahal';
          case 'hotels':
            return 'Hotel Deluxe;Resort Paradise';
          case 'round_trip':
          case 'airport_transfers':
          case 'pickup_drop':
          case 'breakfast':
          case 'dinner':
            return 'true';
          case 'lunch':
            return 'false';
          case 'hotel_category':
            return '4 Star';
          case 'activities':
            return 'City Tour;Museum Visit;Local Market';
          case 'activity_count':
            return '5';
          case 'is_combo':
            return 'false';
          case 'combo_features':
            return 'Flight;Hotel;Sightseeing';
          default:
            if (col.includes('price') && col.includes('days')) {
              return '25000';
            }
            if (col.includes('day_') && col.includes('title')) {
              return 'Day Activity Title';
            }
            if (col.includes('day_') && col.includes('activities')) {
              return 'Activity 1;Activity 2;Activity 3';
            }
            if (col.includes('day_') && col.includes('accommodation')) {
              return 'Hotel Name';
            }
            if (col.includes('day_') && (col.includes('breakfast') || col.includes('lunch') || col.includes('dinner'))) {
              return 'Meal details';
            }
            return '';
        }
      }).join(',');
      return headers + '\n' + exampleRow;
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    console.log('Detected delimiter:', delimiter === '\t' ? 'tab' : 'comma');

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
  
    console.log('Headers found:', headers);

    return rows.map((row, index) => {
      const values = parseCSVLine(row).map(v => v.trim().replace(/""/g, '"'));
      const obj: any = {};
      
      headers.forEach((header, headerIndex) => {
        let value = values[headerIndex] || '';
        value = value.trim();
        
        if (['price', 'old_price', 'original_price'].includes(header) || 
            header.includes('price_') && header.includes('days')) {
          const numericValue = value.replace(/[^0-9]/g, '');
          obj[header] = numericValue ? parseInt(numericValue, 10) : 0;
        } else if (header === 'rating') {
          const numericValue = value.replace(/[^0-9.]/g, '');
          obj[header] = numericValue ? parseFloat(numericValue) : 5.0;
        } else if (header === 'activity_count') {
          const numericValue = value.replace(/[^0-9]/g, '');
          obj[header] = numericValue ? parseInt(numericValue, 10) : 0;
        } else {
          obj[header] = value;
        }
      });
      
      console.log(`Row ${index + 1}:`, obj);
      return obj;
    }).filter(obj => {
      // For itinerary management, we need either package_id or package_title
      const hasPackageId = obj.package_id && obj.package_id.trim() !== '';
      const hasPackageTitle = obj.package_title && obj.package_title.trim() !== '';
      const hasTitle = (obj.title || obj.name) && (obj.title || obj.name).trim() !== '';
      
      return obj && (hasPackageId || hasPackageTitle || hasTitle);
    });
  };

  const validateData = (data: any[]) => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      // Check for package identification
      if (!row.package_id && !row.package_title && !selectedPackageId) {
        errors.push(`Row ${index + 1}: Package ID or Package Title is required when no package is pre-selected`);
      }
      
      // Validate package exists if package_id is provided
      if (row.package_id && packages.length > 0) {
        const packageExists = packages.some(pkg => pkg.id === row.package_id);
        if (!packageExists) {
          errors.push(`Row ${index + 1}: Package ID '${row.package_id}' does not exist`);
        }
      }
      
      // Validate package exists if package_title is provided
      if (row.package_title && packages.length > 0) {
        const packageExists = packages.some(pkg => pkg.title === row.package_title);
        if (!packageExists) {
          errors.push(`Row ${index + 1}: Package Title '${row.package_title}' does not exist`);
        }
      }
      
      // Validate pricing fields
      if (row.price_3_days_with_flights !== undefined && (isNaN(row.price_3_days_with_flights) || row.price_3_days_with_flights < 0)) {
        errors.push(`Row ${index + 1}: Invalid price_3_days_with_flights value`);
      }
      
      if (row.price_5_days_with_flights !== undefined && (isNaN(row.price_5_days_with_flights) || row.price_5_days_with_flights < 0)) {
        errors.push(`Row ${index + 1}: Invalid price_5_days_with_flights value`);
      }
      
      if (row.price_7_days_with_flights !== undefined && (isNaN(row.price_7_days_with_flights) || row.price_7_days_with_flights < 0)) {
        errors.push(`Row ${index + 1}: Invalid price_7_days_with_flights value`);
      }
      
      // Validate URLs
      if (row.hero_image && row.hero_image.trim() !== '' && !row.hero_image.startsWith('http')) {
        errors.push(`Row ${index + 1}: Hero image must be a valid URL starting with http`);
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

      const fileColumns = Object.keys(data[0]);
      const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
      
      if (missingColumns.length > 0) {
        toast({
          title: "Missing Columns",
          description: `Missing columns: ${missingColumns.join(', ')}. Please check the template for required columns.`,
          variant: "destructive",
        });
        return;
      }

      const validationErrors = validateData(data);
      if (validationErrors.length > 0) {
        toast({
          title: "Data Validation Failed",
          description: (
            <div className="max-h-60 overflow-y-auto">
              {validationErrors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-sm">{err}</p>
              ))}
              {validationErrors.length > 5 && (
                <p className="text-sm">+ {validationErrors.length - 5} more errors...</p>
              )}
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      onDataParsed(data);
      toast({
        title: "Success",
        description: `${data.length} rows parsed successfully`,
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
            Expected columns: {expectedColumns.slice(0, 8).join(', ')}
            {expectedColumns.length > 8 && `... and ${expectedColumns.length - 8} more`}
          </p>
          {selectedPackageId && (
            <p className="text-sm text-green-600 mb-2">
              ✓ Uploading for selected package. Package ID will be automatically assigned.
            </p>
          )}
          {!selectedPackageId && (
            <p className="text-sm text-yellow-600 mb-2">
              ⚠️ Important: Include 'package_id' or 'package_title' column to link data to specific packages.
            </p>
          )}
          <p className="text-sm text-yellow-600 mb-2">
            ⚠️ Ensure price fields contain only numbers, boolean fields use 'true'/'false', and separate multiple values with semicolons (;).
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

export default SpreadsheetUploadIt;