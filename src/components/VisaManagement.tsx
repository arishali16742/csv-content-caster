import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import SpreadsheetUploadVisaInfo from './SpreadsheetUploadVisaInfo';

interface VisaRate {
  id: string;
  origin_country: string;
  destination_country: string;
  price_15_days: number;
  price_30_days: number;
  price_yearly: number;
}

const countries = [
  "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const VisaManagement = () => {
  const [visaRates, setVisaRates] = useState<VisaRate[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editData, setEditData] = useState<Partial<VisaRate>>({});
  const [newRate, setNewRate] = useState({
    origin_country: '',
    destination_country: '',
    price_15_days: 0,
    price_30_days: 0,
    price_yearly: 0
  });
  const [selectedRates, setSelectedRates] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadVisaRates();
  }, []);

  const loadVisaRates = async () => {
    const { data, error } = await supabase
      .from('visa_rates')
      .select('*')
      .order('origin_country', { ascending: true });
    
    if (data) {
      setVisaRates(data);
    } else if (error) {
      toast({
        title: "Error",
        description: "Failed to load visa rates",
        variant: "destructive"
      });
    }
  };

  const handleCSVData = async (data: any[]) => {
    try {
      const processedData = data.map(row => ({
        origin_country: row.origin_country || '',
        destination_country: row.destination_country || '',
        price_15_days: parseInt(row.price_15_days) || 0,
        price_30_days: parseInt(row.price_30_days) || 0,
        price_yearly: parseInt(row.price_yearly) || 0
      }));

      const { error } = await supabase
        .from('visa_rates')
        .upsert(processedData, {
          onConflict: 'origin_country,destination_country'
        });

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Error",
          description: "Failed to upload visa rates",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `${processedData.length} visa rates uploaded successfully`
        });
        loadVisaRates();
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process CSV data",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (rate: VisaRate) => {
    setIsEditing(rate.id);
    setEditData(rate);
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from('visa_rates')
      .update(editData)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update visa rate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Visa rate updated successfully"
      });
      setIsEditing(null);
      setEditData({});
      loadVisaRates();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('visa_rates')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete visa rate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Visa rate deleted successfully"
      });
      loadVisaRates();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRates.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one visa rate to delete",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('visa_rates')
      .delete()
      .in('id', selectedRates);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected visa rates",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `${selectedRates.length} visa rates deleted successfully`
      });
      setSelectedRates([]);
      loadVisaRates();
    }
  };

  const handleAdd = async () => {
    if (!newRate.origin_country || !newRate.destination_country) {
      toast({
        title: "Error",
        description: "Please select both origin and destination countries",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('visa_rates')
      .insert([newRate]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add visa rate",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Visa rate added successfully"
      });
      setIsAdding(false);
      setNewRate({
        origin_country: '',
        destination_country: '',
        price_15_days: 0,
        price_30_days: 0,
        price_yearly: 0
      });
      loadVisaRates();
    }
  };

  const toggleSelectRate = (id: string) => {
    setSelectedRates(prev => 
      prev.includes(id) 
        ? prev.filter(rateId => rateId !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAllRates = () => {
    if (selectedRates.length === visaRates.length) {
      setSelectedRates([]);
    } else {
      setSelectedRates(visaRates.map(rate => rate.id));
    }
  };

  const expectedColumns = ['origin_country', 'destination_country', 'price_15_days', 'price_30_days', 'price_yearly'];
  const templateData = [
    {
      origin_country: 'India',
      destination_country: 'United States',
      price_15_days: 8000,
      price_30_days: 15000,
      price_yearly: 45000
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Visa Rate Management</h2>
        <div className="flex gap-2">
          {selectedRates.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedRates.length})
            </Button>
          )}
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Rate
          </Button>
        </div>
      </div>

      {/* CSV Upload Section */}
      <SpreadsheetUploadVisaInfo
        onDataParsed={handleCSVData}
        
        title="Upload Visa Rates CSV"
        templateData={templateData}
      />

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Add New Visa Rate</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={newRate.origin_country} onValueChange={(value) => setNewRate({...newRate, origin_country: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Origin Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={newRate.destination_country} onValueChange={(value) => setNewRate({...newRate, destination_country: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Destination Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="15 Days Price"
              value={newRate.price_15_days}
              onChange={(e) => setNewRate({...newRate, price_15_days: parseInt(e.target.value) || 0})}
            />

            <Input
              type="number"
              placeholder="30 Days Price"
              value={newRate.price_30_days}
              onChange={(e) => setNewRate({...newRate, price_30_days: parseInt(e.target.value) || 0})}
            />

            <Input
              type="number"
              placeholder="Yearly Price"
              value={newRate.price_yearly}
              onChange={(e) => setNewRate({...newRate, price_yearly: parseInt(e.target.value) || 0})}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Save</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <input
                type="checkbox"
                checked={selectedRates.length === visaRates.length && visaRates.length > 0}
                onChange={toggleSelectAllRates}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </TableHead>
            <TableHead>Origin Country</TableHead>
            <TableHead>Destination Country</TableHead>
            <TableHead>15 Days (₹)</TableHead>
            <TableHead>30 Days (₹)</TableHead>
            <TableHead>Yearly (₹)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visaRates.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedRates.includes(rate.id)}
                  onChange={() => toggleSelectRate(rate.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </TableCell>
              <TableCell>
                {isEditing === rate.id ? (
                  <Select 
                    value={editData.origin_country || rate.origin_country} 
                    onValueChange={(value) => setEditData({...editData, origin_country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  rate.origin_country
                )}
              </TableCell>
              <TableCell>
                {isEditing === rate.id ? (
                  <Select 
                    value={editData.destination_country || rate.destination_country} 
                    onValueChange={(value) => setEditData({...editData, destination_country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  rate.destination_country
                )}
              </TableCell>
              <TableCell>
                {isEditing === rate.id ? (
                  <Input
                    type="number"
                    value={editData.price_15_days ?? rate.price_15_days}
                    onChange={(e) => setEditData({...editData, price_15_days: parseInt(e.target.value) || 0})}
                  />
                ) : (
                  `₹${rate.price_15_days.toLocaleString()}`
                )}
              </TableCell>
              <TableCell>
                {isEditing === rate.id ? (
                  <Input
                    type="number"
                    value={editData.price_30_days ?? rate.price_30_days}
                    onChange={(e) => setEditData({...editData, price_30_days: parseInt(e.target.value) || 0})}
                  />
                ) : (
                  `₹${rate.price_30_days.toLocaleString()}`
                )}
              </TableCell>
              <TableCell>
                {isEditing === rate.id ? (
                  <Input
                    type="number"
                    value={editData.price_yearly ?? rate.price_yearly}
                    onChange={(e) => setEditData({...editData, price_yearly: parseInt(e.target.value) || 0})}
                  />
                ) : (
                  `₹${rate.price_yearly.toLocaleString()}`
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {isEditing === rate.id ? (
                    <>
                      <Button size="sm" onClick={() => handleSave(rate.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {setIsEditing(null); setEditData({})}}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(rate)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(rate.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VisaManagement;