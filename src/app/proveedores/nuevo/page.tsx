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

export default function SupplierForm() {
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
		name: z.string()
			.min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
			.max(50, { message: 'El nombre no puede tener más de 50 caracteres' }),
		description: z.string()
			.min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
			.max(200, { message: 'La descripción no puede tener más de 200 caracteres' }),
		phone: z.string()
			.min(8, { message: 'El teléfono debe tener 8 caracteres' })
			.max(8, { message: 'El teléfono debe tener 8 caracteres' }),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch('http://localhost:3001/web/api/supplier', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(values),
		});

		if (res.ok) {
			// Handle successful submission
			toast({description:'Proveedor creado exitosamente'});
		} else {
			// Handle error
			toast({description:'Error al crear el proveedor', variant: "destructive"});
		}
	};

	if (!isLogged) return null;

	return (
		<div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#503dab] to-[#604CC3]">
			<div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fade-in">
				<div className="mb-8 text-center">
					<h2 className="text-3xl font-bold">Crear Proveedor</h2>
				</div>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre del Proveedor</FormLabel>
									<FormControl>
										<Input id="name" placeholder="Ingrese el nombre del proveedor" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descripción</FormLabel>
									<FormControl>
										<Input id="description" placeholder="Ingrese la descripción del proveedor" {...field} />
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
										<Input id="phone" placeholder="Ingrese el teléfono del proveedor" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">Crear Proveedor</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}