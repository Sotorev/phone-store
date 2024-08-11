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
import SupplierEditForm from '@/components/component/supplier-edit-form';
import { toast } from '@/components/ui/use-toast';


const SuppliersPage = () => {
	const { isLogged } = useContext(AuthContext);
	const [suppliers, setSuppliers] = useState<{ supplier_id: string, name: string, description: string, phone: string, is_active: 1 | 0 }[]>([]);
	const router = useRouter();
	const [showModal, setShowModal] = useState({ edit: false, delete: false });
	const [selectedSupplier, setSelectedSupplier] = useState<{ supplier_id: string, name: string, description: string, phone: string, is_active: 1 | 0 } | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

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

	}, []);

	const onEdit = (id: string) => {
		const supplier = suppliers.find(supplier => supplier.supplier_id === id);
		if (supplier) {
			setSelectedSupplier(supplier);
			setShowModal({ ...showModal, edit: true });
		}
	}

	const onDelete = (id: string) => {
		const supplier = suppliers.find(supplier => supplier.supplier_id === id);
		if (supplier) {
			setSelectedSupplier(supplier);
		}
		setShowModal({ ...showModal, delete: true })
	}

	const deleteSupplier = async (id: string) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch(`http://localhost:3001/web/api/supplier/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},
		});

		if (res.ok) {
			const updatedSuppliers = suppliers.filter(supplier => supplier.supplier_id !== id);
			setSuppliers(updatedSuppliers);
			setShowModal({ ...showModal, delete: false });
			toast({ description: 'Proveedor eliminado exitosamente' });
		}
		else {
			toast({ description: 'Error al eliminar el proveedor', variant: "destructive" });
		}
	}

	if (!isLogged) {
		return null
	}

	return (
		<>
			<Table>
				<TableCaption>Lista de proveedores</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[150px]">Nombre</TableHead>
						<TableHead>Descripción</TableHead>
						<TableHead>Teléfono</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{suppliers.length > 0 && suppliers.map((supplier) => (
						<TableRow key={supplier.supplier_id}>
							<TableCell>{supplier.name}</TableCell>
							<TableCell>{supplier.description}</TableCell>
							<TableCell>{supplier.phone}</TableCell>
							<TableCell className="text-right space-x-2">
								<Button onClick={() => onEdit(supplier.supplier_id)}>Editar</Button>
								<Button variant="destructive" onClick={() => onDelete(supplier.supplier_id)}>Eliminar</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Modal isOpen={showModal.delete} onClose={() => setShowModal({ ...showModal, delete: false })} hideCloseButton={true}>
				{selectedSupplier && (
					<div className="p-4">
						<h2 className="text-2xl font-bold">Eliminar proveedor</h2>
						<p>¿Estás seguro que deseas eliminar el proveedor?</p>
						<div className="flex justify-end gap-4">
							<Button variant="secondary" onClick={() => setShowModal({ ...showModal, delete: false })}>Cancelar</Button>
							<Button variant="destructive" onClick={() => deleteSupplier(selectedSupplier.supplier_id)}>Eliminar</Button>
						</div>
					</div>
				)}
			</Modal>

			<Modal isOpen={showModal.edit} onClose={() => setShowModal({ ...showModal, edit: false })} hideCloseButton={true} className='w-full'>
				{selectedSupplier && (
					<SupplierEditForm
						supplierId={selectedSupplier.supplier_id}
						name={selectedSupplier.name}
						description={selectedSupplier.description}
						phone={selectedSupplier.phone}
						onClose={() => setShowModal({ ...showModal, edit: false })}
					/>
				)}
			</Modal>

		</>
	)

}

export default SuppliersPage