'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
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

export default function CustomerForm() {
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
		email: z.string()
			.email({ message: 'El correo electrónico no es válido' }),
		phone: z.string()
			.min(8, { message: 'El teléfono debe tener 8 caracteres' })
			.max(8, { message: 'El teléfono debe tener 8 caracteres' }),
		address: z.string()
			.min(10, { message: 'La dirección debe tener al menos 10 caracteres' })
			.max(200, { message: 'La dirección no puede tener más de 200 caracteres' }),
		is_active: z.boolean(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			full_name: '',
			email: '',
			phone: '',
			address: '',
			is_active: false,
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch('http://localhost:3001/web/api/customer', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(values),
		});

		if (res.ok) {
			// Handle successful submission
			toast({ description: 'Cliente creado exitosamente' });
		} else {
			// Handle error
			toast({ description: 'Error al crear el cliente', variant: "destructive" });
		}
	};

	if (!isLogged) return null;

	return (
		<div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#503dab] to-[#604CC3]">
			<div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fade-in">
				<div className="mb-8 text-center">
					<h2 className="text-3xl font-bold">Crear Cliente</h2>
				</div>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="full_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre completo</FormLabel>
									<FormControl>
										<Input id="full_name" placeholder="Ingrese el nombre completo" {...field} />
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
										<Input id="email" placeholder="Ingrese el correo electrónico" {...field} />
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
										<Input id="phone" placeholder="Ingrese el teléfono" {...field} />
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
										<Input id="address" placeholder="Ingrese la dirección" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">Crear Cliente</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}