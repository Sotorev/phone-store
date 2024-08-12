import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '@/hooks/auth-context';
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";
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
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";
import path from "path";

interface Props {
	product_id: string;
	product_name: string;
	category_id: string;
	price: number;
	quantity: number;
	categories: Category[];
	suppliers: Supplier[];
	products: Product[];
	supplier_id: string;
	updateProducts: () => void;
	onClose: () => void;
}

interface Supplier {
	supplier_id: string;
	name: string;
}


interface Category {
	category_id: string;
	category_name: string;
}

interface Product {
	product_id: string;
	product_name: string;
	category_id: string;
	price: number;
	quantity: number;
	supplier_id: string;
}

export default function PerishableProductEditForm({ product_id, supplier_id, suppliers, product_name, category_id, price, quantity, categories, products, onClose, updateProducts }: Props) {

	const router = useRouter();
	const { isLogged } = useContext(AuthContext);
	const { toast } = useToast();
	const pathname = usePathname();


	useEffect(() => {

		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}
	}, []);

	const formSchema = z.object({
		product_name: z.string()
			.min(2, { message: 'El nombre del producto debe tener al menos 2 caracteres' })
			.max(50, { message: 'El nombre del producto no puede tener más de 50 caracteres' }),
		category_id: z.string(),
		price: z.number()
			.min(0, { message: 'El precio debe ser mayor o igual a 0' }),
		quantity: z.number()
			.min(0, { message: 'La cantidad debe ser mayor o igual a 0' }),
		supplier_id: z.string(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			product_name,
			category_id,
			price: Number(price),
			quantity,
			supplier_id
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const url = pathname === '/productos/ver/perecederos' ? 'perishableProducts' : 'nonPerishableProducts';
		const res = await fetch(`http://localhost:3001/web/api/${url}/${product_id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(values),
		});

		if (res.ok) {
			// Handle successful submission
			const updatedProducts = products.map(product => {
				if (product.product_id === product_id) {
					return { ...product, ...values };
				}
				return product;
			});
			updateProducts();
			toast({ description: 'Producto perecedero editado exitosamente' });
			onClose();
		} else {
			// Handle error
			toast({ description: 'Error al editar el producto perecedero', variant: "destructive" });
		}
	};

	if (!isLogged) return null;
	
	return (

		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="product_name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre del Producto</FormLabel>
							<FormControl>
								<Input id="product_name" placeholder="Ingrese el nombre del producto" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="category_id"
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
					name="supplier_id"
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
										{suppliers.length > 0 && suppliers.map((supplier) => (
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
								<Input id="price" type="number" placeholder="Ingrese el precio del producto" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full">Editar Producto</Button>
			</form>
		</Form>
	);
}