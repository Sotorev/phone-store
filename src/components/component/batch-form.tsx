'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import AuthContext from '@/hooks/auth-context';

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Props {
	productId: string;
	onClose: () => void;
	updateProducts: () => void;
}

export function BatchForm({ productId, onClose, updateProducts }: Props) {
	const router = useRouter();
	const { isLogged } = useContext(AuthContext);
	const { toast } = useToast();

	const formSchema = z.object({
		expiration_date: z.string().nonempty({ message: 'La fecha de vencimiento es obligatoria' }),
		production_date: z.string().nonempty({ message: 'La fecha de producción es obligatoria' }),
		quantity: z.number().min(1, { message: 'La cantidad debe ser al menos 1' }),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			expiration_date: '',
			production_date: '',
			quantity: 0,
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch('http://localhost:3001/web/api/batch', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify({
				expiration_date: values.expiration_date,
				production_date: values.production_date,
				product_id: productId,
				quantity: values.quantity,
			}),
		});

		if (res.ok) {
			toast({ description: 'Lote creado exitosamente' });
			// Limpiar el formulario
			form.reset();
			updateProducts();
			onClose();
		} else {
			toast({ description: 'Error al crear el lote', variant: 'destructive' });
		}
	};

	if (!isLogged) return null;

	return (

		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="production_date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Fecha de Producción</FormLabel>
							<FormControl>
								<Input type="date" id="production_date" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="expiration_date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Fecha de Vencimiento</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
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
				<Button type="submit" className="w-full">Crear Lote</Button>
			</form>
		</Form>

	);
}
