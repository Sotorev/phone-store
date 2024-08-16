'use client';

import AuthContext from '@/hooks/auth-context';
import React, { useContext, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SalesDetail {
  detail_id: string;
  inventory_perishable_id: string | null;
  inventory_non_perishable_id: string | null;
  quantity: string;
  unit_price: string;
  sales_sale_id: string;
  customers_customer_id: string;
  is_active: 1 | 0;
}

interface Customer {
  customer_id: string;
  full_name: string;
}

interface PerishableProduct {
  product_id: string;
  product_name: string;
  category_id: string;
  price: string;
  is_active: 1 | 0;
  supplier_id: string;
  quantity: string;
}

interface NonPerishableProduct {
  product_id: string;
  product_name: string;
  category_id: string;
  price: string;
  is_active: 1 | 0;
  supplier_id: string;
  quantity: string;
}

const SalesDetailsPage: React.FC = () => {
  const { isLogged } = useContext(AuthContext);
  const [salesDetails, setSalesDetails] = useState<SalesDetail[]>([]);
  const [filteredSalesDetails, setFilteredSalesDetails] = useState<SalesDetail[]>([]);
  const [filter, setFilter] = useState<'all' | 'perishable' | 'non-perishable'>('all');
  const [customersData, setCustomersData] = useState<{ [key: string]: Customer }>({});
  const [perishableProducts, setPerishableProducts] = useState<{ [key: string]: PerishableProduct }>({});
  const [nonPerishableProducts, setNonPerishableProducts] = useState<{ [key: string]: NonPerishableProduct }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDetail, setEditDetail] = useState<SalesDetail | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');
  const router = useRouter();

  const fetchSalesDetails = async () => {

    const token = localStorage.getItem('token');

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:3001/web/api/salesDetails', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data: SalesDetail[] = await res.json();
      setSalesDetails(data);
      applyFilter(filter, data);

      // Fetch customer data
      const customerIds = Array.from(new Set(data.map((detail) => detail.customers_customer_id)));
      const customersMap: { [key: string]: Customer } = {};
      for (const id of customerIds) {
        try {
          const customerRes = await fetch(`http://localhost:3001/web/api/customer/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const customerData: Customer = await customerRes.json();
          customersMap[id] = customerData;
        } catch (error) {
          console.error(`Error fetching customer data for ID ${id}:`, error);
        }
      }
      setCustomersData(customersMap);

      // Fetch perishable product data
      const perishableIds = Array.from(new Set(data.map((detail) => detail.inventory_perishable_id)));
      const perishableMap: { [key: string]: PerishableProduct } = {};
      for (const id of perishableIds) {
        try {
          const productRes = await fetch(`http://localhost:3001/web/api/perishableProducts/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const productData = await productRes.json();
          if (productData.product) {
            perishableMap[id] = productData.product;
          }
        } catch (error) {
          console.error(`Error fetching perishable product data for ID ${id}:`, error);
        }
      }
      setPerishableProducts(perishableMap);

      // Fetch non-perishable product data
      const nonPerishableIds = Array.from(new Set(data.map((detail) => detail.inventory_non_perishable_id)));
      const nonPerishableMap: { [key: string]: NonPerishableProduct } = {};
      for (const id of nonPerishableIds) {
        try {
          const productRes = await fetch(`http://localhost:3001/web/api/nonPerishableProducts/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const productData = await productRes.json();
          if (productData.product) {
            nonPerishableMap[id] = productData.product;
          }
        } catch (error) {
          console.error(`Error fetching non-perishable product data for ID ${id}:`, error);
        }
      }
      setNonPerishableProducts(nonPerishableMap);

    } catch (error) {
      console.error('Error fetching sales details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    

    fetchSalesDetails();
  }, [filter, router]);

  const applyFilter = (filter: 'all' | 'perishable' | 'non-perishable', data: SalesDetail[]) => {
    let filteredData = data;

    if (filter === 'perishable') {
      filteredData = data.filter(detail => detail.inventory_perishable_id !== null && detail.is_active === 1);
    } else if (filter === 'non-perishable') {
      filteredData = data.filter(detail => detail.inventory_non_perishable_id !== null && detail.is_active === 1);
    } else {
      filteredData = data.filter(detail => detail.is_active === 1);
    }

    setFilteredSalesDetails(filteredData);
  };

  const handleFilterChange = (filter: 'all' | 'perishable' | 'non-perishable') => {
    setFilter(filter);
  };

  const handleEditClick = (detail: SalesDetail) => {
    setEditDetail(detail);
    setEditQuantity(detail.quantity);
    setEditUnitPrice(detail.unit_price);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!editDetail) return;

    const updatedDetail = {
      sale_id: editDetail.sales_sale_id,
      user_id: editDetail.customers_customer_id, 
      details: [
        {
          inventory_id: editDetail.inventory_perishable_id || editDetail.inventory_non_perishable_id,
          quantity: editQuantity,
          unit_price: editUnitPrice,
          product_type: editDetail.inventory_perishable_id ? "Perishable" : "Non Perishable",
          customers_customer_id: editDetail.customers_customer_id,
        },
      ],
    };

    

    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:3001/web/api/salesUpdate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDetail),
      });
      setShowEditModal(false);
      fetchSalesDetails()
      
    } catch (error) {
      console.error('Error updating sales detail:', error);
    }
  };

  if (!isLogged) {
    return null;
  }

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" onClick={() => handleFilterChange('all')}>Todos</Button>
        <Button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" onClick={() => handleFilterChange('perishable')}>Perecederos</Button>
        <Button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" onClick={() => handleFilterChange('non-perishable')}>No Perecederos</Button>
      </div>

      <Table>
        <TableCaption>Lista de detalles de ventas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">ID Detalle</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio Unitario</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>ID de venta</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSalesDetails.map(detail => (
            <TableRow key={detail.detail_id}>
              <TableCell>{detail.detail_id}</TableCell>
              <TableCell>
                {detail.inventory_perishable_id
                  ? perishableProducts[detail.inventory_perishable_id]?.product_name
                  : nonPerishableProducts[detail.inventory_non_perishable_id || '']?.product_name}
              </TableCell>
              <TableCell>{detail.quantity}</TableCell>
              <TableCell>{detail.unit_price}</TableCell>
              <TableCell>{customersData[detail.customers_customer_id]?.full_name}</TableCell>
              <TableCell>{detail.sales_sale_id}</TableCell>
              <TableCell>
                <Button onClick={() => handleEditClick(detail)}>Editar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showEditModal && editDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Editar Detalle de Venta</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="text"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
              <input
                type="text"
                value={editUnitPrice}
                onChange={(e) => setEditUnitPrice(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowEditModal(false)} className="mr-2">Cancelar</Button>
              <Button onClick={handleSaveChanges}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesDetailsPage;
