'use client';
import AuthContext from '@/hooks/auth-context';
import React, { useContext, useEffect, useState } from 'react'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Modal from '@/components/component/modal';
import CustomerEditForm from '@/components/component/customer-edit-form';
import { toast } from '@/components/ui/use-toast';


const CustomersPage = () => {
	const { isLogged } = useContext(AuthContext);
	const [customers, setCustomers] = useState<{ customer_id: string, full_name: string, email: string, address: string, phone: string, is_active: 1 | 0 }[]>([]);
	const router = useRouter();
	const [showModal, setShowModal] = useState({ edit: false, delete: false });
	const [selectedCustomer, setSelectedCustomer] = useState<{ customer_id: string, full_name: string, email: string, address: string, phone: string, is_active: 1 | 0 } | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		fetch('http://localhost:3001/web/api/customer', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},

		})
			.then((res) => res.json())
			.then((data) => {
				setCustomers(data);
			});

	}, []);

	const onEdit = (id: string) => {
		const customer = customers.find(customer => customer.customer_id === id);
		if (customer) {
			setSelectedCustomer(customer);
			setShowModal({ ...showModal, edit: true });
		}
	}

	const onDelete = (id: string) => {
		const customer = customers.find(customer => customer.customer_id === id);
		if (customer) {
			setSelectedCustomer(customer);
		}
		setShowModal({ ...showModal, delete: true })
	}

	const deleteCustomer = async (id: string) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch(`http://localhost:3001/web/api/customer/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},
		});

		if (res.ok) {
			const updatedCustomers = customers.filter(customer => customer.customer_id !== id);
			setCustomers(updatedCustomers);
			setShowModal({ ...showModal, delete: false });
			toast({ description: 'Cliente eliminado exitosamente' });
		}
		else {
			toast({ description: 'Error al eliminar el cliente', variant: "destructive" });
		}
	}

	if (!isLogged) {
		return null
	}

	return (
		<>
			<Table>
				<TableCaption>Lista de clientes</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[150px]">Nombre</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Dirección</TableHead>
						<TableHead>Teléfono</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{customers.length > 0 && customers.map((customer) => (
						<TableRow key={customer.customer_id}>
							<TableCell>{customer.full_name}</TableCell>
							<TableCell>{customer.email}</TableCell>
							<TableCell>{customer.address}</TableCell>
							<TableCell>{customer.phone}</TableCell>
							<TableCell className="text-right space-x-2">
								<Button onClick={() => onEdit(customer.customer_id)}>Editar</Button>
								<Button variant="destructive" onClick={() => onDelete(customer.customer_id)}>Eliminar</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Modal isOpen={showModal.delete} onClose={() => setShowModal({ ...showModal, delete: false })} hideCloseButton={true}>
				{selectedCustomer && (
					<div className="p-4">
						<h2 className="text-2xl font-bold">Eliminar cliente</h2>
						<p>¿Estás seguro que deseas eliminar el cliente?</p>
						<div className="flex justify-end gap-4">
							<Button variant="secondary" onClick={() => setShowModal({ ...showModal, delete: false })}>Cancelar</Button>
							<Button variant="destructive" onClick={() => deleteCustomer(selectedCustomer.customer_id)}>Eliminar</Button>
						</div>
					</div>
				)}
			</Modal>

			<Modal isOpen={showModal.edit} onClose={() => setShowModal({ ...showModal, edit: false })} hideCloseButton={true} className='w-full'>
				{selectedCustomer && (
					<CustomerEditForm
						customerId={selectedCustomer.customer_id}
						fullName={selectedCustomer.full_name}
						email={selectedCustomer.email}
						address={selectedCustomer.address}
						phone={selectedCustomer.phone}
						onClose={() => setShowModal({ ...showModal, edit: false })}
						customers={customers}
						setCustomers={setCustomers}
					/>
				)}
			</Modal>

		</>
	)

}

export default CustomersPage