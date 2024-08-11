'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { use, useContext, useEffect, useState } from 'react';
import AuthContext from '@/hooks/auth-context';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";

export function ProductsForm() {
  const router = useRouter();
  const { isLogged } = useContext(AuthContext);
  const [categories, setCategories] = useState<{ category_id: string, category_name: string, is_active: 1 | 0 }[]>([]);
  const [suppliers, setSuppliers] = useState<{ supplier_id: string, name: string, description: string, is_active: 1 | 0 }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
    fetch('http://localhost:3001/web/api/category', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },
    }
    )
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      });
    
    fetch('http://localhost:3001/web/api/supplier', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },

    })
      .then((res) => res.json())
      .then((data) => {
        setSuppliers(data);
      });
    
  }
    , []);

  const formSchema = z.object({
    name: z.string()
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
      .max(50, { message: 'El nombre no puede tener más de 50 caracteres' }),
    category: z.string({ required_error: 'Por favor seleccione una categoría' }),
    price: z.number()
      .min(1, { message: 'El precio debe ser al menos 1' }),
    quantity: z.number()
      .min(1, { message: 'La cantidad debe ser al menos 1' }),
    perishable: z.boolean().default(false).optional(),
    expirationDate: z.string().optional(),
    productionDate: z.string().optional(),
    supplier: z.string({ required_error: 'Por favor seleccione un proveedor' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      perishable: false,
      expirationDate: '',
      productionDate: '',
      price: 0,
      quantity: 0,

    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }

    if (values.perishable) {
      const res = await fetch('http://localhost:3001/web/api/perishableProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.name,
          categoryId: values.category,
          price: values.price,
          quantity: values.quantity,
          expirationDate: values.expirationDate,
          productionDate: values.productionDate,
        }),
      });



    }

  };

  if (!isLogged) return null;




  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#503dab] to-[#604CC3]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fade-in">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Crear Producto</h2>
        </div>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input id="name" placeholder="Ingrese el nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => (
                          <SelectItem value={category.category_id.toString()} key={category.category_id}>
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedores</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {suppliers.map((supplier) => (
                          <SelectItem value={supplier.supplier_id.toString()} key={supplier.supplier_id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input type="number" id="price" placeholder="Ingrese el precio" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input type="number" id="quantity" placeholder="Ingrese la cantidad" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="perishable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      El producto es perecedero
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            {form.watch('perishable') && (
              <>
                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de vencimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Producción</FormLabel>
                      <FormControl>
                        <Input type="date" id="productionDate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button type="submit" className="w-full">Crear Producto</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}