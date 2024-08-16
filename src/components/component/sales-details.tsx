import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
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
import { useToast } from "@/components/ui/use-toast";

export function SalesForm() {
  const router = useRouter();
  const { isLogged } = useContext(AuthContext);
  const [categories, setCategories] = useState<{ category_id: string, category_name: string, is_active: 1 | 0 }[]>([]);
  const [suppliers, setSuppliers] = useState<{ supplier_id: string, name: string, description: string, is_active: 1 | 0 }[]>([]);
  const { toast } = useToast();
  const [key, setKey] = useState(+new Date());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetch('http://localhost:3001/web/api/category', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },
    })
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch('http://localhost:3001/web/api/supplier', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` || '',
      },
    })
      .then((res) => res.json())
      .then((data) => setSuppliers(data));

  }, [router]);

  const formSchema = z.object({
    user_id: z.string().min(1, { message: 'El ID de usuario es obligatorio' }),
    details: z.array(z.object({
      inventory_id: z.string().min(1, { message: 'El ID del inventario es obligatorio' }),
      quantity: z.string().min(1, { message: 'La cantidad debe ser al menos 1' }),
      unit_price: z.string().min(1, { message: 'El precio debe ser al menos 0.01' }),
      product_type: z.enum(['Perishable', 'Non Perishable'], { message: 'Selecciona un tipo de producto' }),
      customers_customer_id: z.string().min(1, { message: 'El ID del cliente es obligatorio' }),
    }))
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: '',
      details: [{
        inventory_id: '',
        quantity: '',
        unit_price: '',
        product_type: 'Non Perishable',
        customers_customer_id: '',
      }]
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setKey(+new Date());

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const formattedValues = {
      user_id: Number(values.user_id),
      details: values.details.map(detail => ({
        inventory_id: Number(detail.inventory_id),
        quantity: Number(detail.quantity),
        unit_price: Number(detail.unit_price),
        product_type: detail.product_type,
        customers_customer_id: Number(detail.customers_customer_id),
      })),
    };

    try {
      const res = await fetch('http://localhost:3001/web/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (res.ok) {
        toast({ description: 'Venta creada exitosamente' });
        form.reset();
      } else {
        const errorData = await res.json();
        toast({ description: `Error al crear la venta: ${errorData.message}`, variant: 'destructive' });
      }
    } catch (error) {
      toast({ description: 'Error al crear la venta', variant: 'destructive' });
    }
  };

  if (!isLogged) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#503dab] to-[#604CC3]" >
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fade-in">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Crear Venta</h2>
        </div>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Usuario</FormLabel>
                  <FormControl>
                    <Input type="text" id="user_id" placeholder="Ingrese el ID de usuario que esta generando la venta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('details').map((_, index) => (
              <div key={index}>
                <FormField
                  control={form.control}
                  name={`details.${index}.inventory_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producto</FormLabel>
                      <FormControl>
                        <Input type="text" id={`inventory_id_${index}`} placeholder="Ingrese el ID de inventario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`details.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="text" id={`quantity_${index}`} placeholder="Ingrese la cantidad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`details.${index}.unit_price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Unitario</FormLabel>
                      <FormControl>
                        <Input type="text" step="0.01" id={`unit_price_${index}`} placeholder="Ingrese el precio unitario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`details.${index}.product_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Producto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo de producto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Non Perishable">No Perecedero</SelectItem>
                            <SelectItem value="Perishable">Perecedero</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`details.${index}.customers_customer_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID del Cliente</FormLabel>
                      <FormControl>
                        <Input type="text" id={`customers_customer_id_${index}`} placeholder="Ingrese el ID del cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button type="submit" className="w-full">Crear Venta</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
