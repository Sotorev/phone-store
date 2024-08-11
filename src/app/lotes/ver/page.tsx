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
import PerishableProductEditForm from '@/components/component/perishable-products-edit-form';
import { toast } from '@/components/ui/use-toast';

interface BatchProps {
	batch_id: number;
	quantity: number;
	expiration_date: string;
	production_date: string;
	PerishableProduct: {
		product_id: number;
		product_name: string;
		price: string;
		global_quantity: number;
		category_id: string;
	};
}


const PerishableProductsPage = () => {
	const { isLogged } = useContext(AuthContext);
	const [batches, setBatches] = useState<BatchProps[]>([]);
	const router = useRouter();
	const [showModal, setShowModal] = useState({ edit: false, delete: false });
	const [selectedBatch, setSelectedBatch] = useState<BatchProps | null>(null);
	const [categories, setCategories] = useState<{ category_id: string, category_name: string }[]>([]);


	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		fetch('http://localhost:3001/web/api/batch', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},

		})
			.then((res) => res.json())
			.then((data) => {
				setBatches(data);
			});

		fetch('http://localhost:3001/web/api/category', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},
		})
			.then((res) => res.json())
			.then((data) => {
				setCategories(data);
			}
			);


	}, []);

	// const updateProducts = async () => {
	// 	const token = localStorage.getItem('token');
	// 	if (!token) {
	// 		router.push('/login');
	// 	}

	// 	fetch('http://localhost:3001/web/api/perishableProducts', {
	// 		method: 'GET',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'Authorization': `Bearer ${token}` || '',
	// 		},

	// 	})
	// 		.then((res) => res.json())
	// 		.then((data) => {
	// 			setPerishableProducts(data);
	// 		});
	// }

	// const onEdit = (id: string) => {
	// 	const product = perishableProducts.find(product => product.product_id === id);
	// 	if (product) {
	// 		setSelectedProduct(product);
	// 		setShowModal({ ...showModal, edit: true });
	// 	}
	// }

	const onDelete = (id: number) => {
		const batch = batches.find(batch => batch.batch_id === id);
		if (batch) {
			setSelectedBatch(batch);
		}
		setShowModal({ ...showModal, delete: true })
	}

	const deleteBatch = async (id: number) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch(`http://localhost:3001/web/api/batch/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},
		});

		if (res.ok) {
			const updatedBatches = batches.filter(batch => batch.batch_id !== id);
			setBatches(updatedBatches);
			setShowModal({ ...showModal, delete: false });
			toast({ description: 'Batch deleted successfully' });
		}
		else {
			toast({ description: 'Error deleting the batch', variant: "destructive" });
		}
	}

	if (!isLogged) {
		return null
	}

	return (
		<>
			<Table>
				<TableCaption>Lista de lotes de productos perecederos</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[150px]">Nombre del producto</TableHead>
						<TableHead>Categoría</TableHead>
						<TableHead>Precio Unitario</TableHead>
						<TableHead>Stock de lote</TableHead>
						<TableHead>Stock global</TableHead>

						{/* <TableHead>Fecha de producción</TableHead>
						<TableHead>Fecha de expiración</TableHead> */}
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{batches.length > 0 && batches.map((batch) => (
						<TableRow key={batch.PerishableProduct.product_id}>
							<TableCell>{batch.PerishableProduct.product_name}</TableCell>
							<TableCell>{categories.find(category => category.category_id === batch.PerishableProduct.category_id)?.category_name}</TableCell>
							<TableCell>{batch.PerishableProduct.price}</TableCell>
							<TableCell>{batch.quantity}</TableCell>
							<TableCell>{batch.PerishableProduct.global_quantity}</TableCell>
							{/* <TableCell>{product.production_date}</TableCell>
							<TableCell>{product.expiration_date}</TableCell> */}
							<TableCell className="text-right space-x-2">
								<Button variant="destructive" onClick={() => onDelete(batch.batch_id)}>Delete</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Modal isOpen={showModal.delete} onClose={() => setShowModal({ ...showModal, delete: false })} hideCloseButton={true}>
				{selectedBatch && (
					<div className="p-4">
						<h2 className="text-2xl font-bold">Delete batch</h2>
						<p>Are you sure you want to delete the batch?</p>
						<div className="flex justify-end gap-4">
							<Button variant="secondary" onClick={() => setShowModal({ ...showModal, delete: false })}>Cancel</Button>
							<Button variant="destructive" onClick={() => deleteBatch(selectedBatch.batch_id)}>Delete</Button>
						</div>
					</div>
				)}
			</Modal>



		</>
	)

}

export default PerishableProductsPage