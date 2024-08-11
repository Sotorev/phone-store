import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { custom, z } from "zod";
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '@/hooks/auth-context';
import { useToast } from "@/components/ui/use-toast";

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

interface Props {
	customerId: string;
	fullName: string;
	address: string;
	phone: string;
	email: string;
	onClose: () => void;
	customers: { customer_id: string, full_name: string, address: string, is_active: 1 | 0, phone: string, email: string }[];
	setCustomers: React.Dispatch<React.SetStateAction<{ customer_id: string, full_name: string, address: string, phone: string, email: string, is_active: 1 | 0 }[]>>;
}

export default function CustomerEditForm({ customerId, fullName, address, phone, email, onClose, customers, setCustomers }: Props) {
	const router = useRouter();
	const { isLogged } = useContext(AuthContext);
	const { toast } = useToast();

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}
	}, []);

	const formSchema = z.object({
		full_name: z.string()
			.min(2, { message: 'El nombre completo debe tener al menos 2 caracteres' })
			.max(50, { message: 'El nombre completo no puede tener más de 50 caracteres' }),
		address: z.string()
			.min(10, { message: 'La dirección debe tener al menos 10 caracteres' })
			.max(200, { message: 'La dirección no puede tener más de 200 caracteres' }),
		phone: z.string()
			.min(8, { message: 'El teléfono debe tener 8 caracteres' })
			.max(8, { message: 'El teléfono debe tener 8 caracteres' }),
		email: z.string()
			.email({ message: 'El correo electrónico no es válido' }),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			full_name: fullName,
			address,
			phone,
			email,
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch(`http://localhost:3001/web/api/customer/${customerId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(values),
		});

		if (res.ok) {
			// Handle successful submission
			const updatedCustomers = customers.map(customer => {
				if (customer.customer_id === customerId) {
					return { ...customer, ...values };
				}
				return customer;
			});
			setCustomers(updatedCustomers);
			toast({ description: 'Cliente editado exitosamente' });
			onClose();
		} else {
			// Handle error
			toast({ description: 'Error al editar el cliente', variant: "destructive" });
		}
	};

	if (!isLogged) return null;

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="full_name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre completo</FormLabel>
							<FormControl>
								<Input id="full_name" placeholder="Ingrese el nombre completo del cliente" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Dirección</FormLabel>
							<FormControl>
								<Input id="address" placeholder="Ingrese la dirección del cliente" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Teléfono</FormLabel>
							<FormControl>
								<Input id="phone" placeholder="Ingrese el teléfono del cliente" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Correo electrónico</FormLabel>
							<FormControl>
								<Input id="email" placeholder="Ingrese el correo electrónico del cliente" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full">Editar Cliente</Button>
			</form>
		</Form>
	);
}