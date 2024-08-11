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


const PerishableProductsPage = () => {
	const { isLogged } = useContext(AuthContext);
	const [perishableProducts, setPerishableProducts] = useState<{ product_id: string, product_name: string, category_id: string, price: number, quantity: number }[]>([]);
	const router = useRouter();
	const [showModal, setShowModal] = useState({ edit: false, delete: false });
	const [selectedProduct, setSelectedProduct] = useState<{ product_id: string, product_name: string, category_id: string, price: number, quantity: number } | null>(null);
	const [categories, setCategories] = useState<{ category_id: string, category_name: string }[]>([]);


	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		fetch('http://localhost:3001/web/api/nonPerishableProducts', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},

		})
			.then((res) => res.json())
			.then((data) => {
				setPerishableProducts(data);
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

	const updateProducts = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		fetch('http://localhost:3001/web/api/nonPerishableProducts', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},

		})
			.then((res) => res.json())
			.then((data) => {
				setPerishableProducts(data);
			});
	}

	const onEdit = (id: string) => {
		const product = perishableProducts.find(product => product.product_id === id);
		if (product) {
			setSelectedProduct(product);
			setShowModal({ ...showModal, edit: true });
		}
	}

	const onDelete = (id: string) => {
		const product = perishableProducts.find(product => product.product_id === id);
		if (product) {
			setSelectedProduct(product);
		}
		setShowModal({ ...showModal, delete: true })
	}

	const deletePerishableProduct = async (id: string) => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		const res = await fetch(`http://localhost:3001/web/api/nonPerishableProducts/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},
		});

		if (res.ok) {
			const updatedProducts = perishableProducts.filter(product => product.product_id !== id);
			setPerishableProducts(updatedProducts);
			setShowModal({ ...showModal, delete: false });
			toast({ description: 'Product deleted successfully' });
		}
		else {
			toast({ description: 'Error deleting the product', variant: "destructive" });
		}
	}

	if (!isLogged) {
		return null
	}

	return (
		<>
			<Table>
				<TableCaption>Lista de productos no perecederos</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[150px]">Nombre del producto</TableHead>
						<TableHead>Categoría</TableHead>
						<TableHead>Precio</TableHead>
						<TableHead>Cantidad</TableHead>
						{/* <TableHead>Fecha de producción</TableHead>
						<TableHead>Fecha de expiración</TableHead> */}
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{perishableProducts.length > 0 && perishableProducts.map((product) => (
						<TableRow key={product.product_id}>
							<TableCell>{product.product_name}</TableCell>
							<TableCell>{categories.find(category => category.category_id === product.category_id)?.category_name}</TableCell>
							<TableCell>{product.price}</TableCell>
							<TableCell>{product.quantity}</TableCell>
							{/* <TableCell>{product.production_date}</TableCell>
							<TableCell>{product.expiration_date}</TableCell> */}
							<TableCell className="text-right space-x-2">
								<Button onClick={() => onEdit(product.product_id)}>Edit</Button>
								<Button variant="destructive" onClick={() => onDelete(product.product_id)}>Delete</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Modal isOpen={showModal.delete} onClose={() => setShowModal({ ...showModal, delete: false })} hideCloseButton={true}>
				{selectedProduct && (
					<div className="p-4">
						<h2 className="text-2xl font-bold">Delete product</h2>
						<p>Are you sure you want to delete the product?</p>
						<div className="flex justify-end gap-4">
							<Button variant="secondary" onClick={() => setShowModal({ ...showModal, delete: false })}>Cancel</Button>
							<Button variant="destructive" onClick={() => deletePerishableProduct(selectedProduct.product_id)}>Delete</Button>
						</div>
					</div>
				)}
			</Modal>

			<Modal isOpen={showModal.edit} onClose={() => setShowModal({ ...showModal, edit: false })} hideCloseButton={true} className='w-full'>
				{selectedProduct && (
					<PerishableProductEditForm
						product_id={selectedProduct.product_id}
						product_name={selectedProduct.product_name}
						category_id={selectedProduct.category_id}
						price={selectedProduct.price}
						quantity={selectedProduct.quantity}
						onClose={() => setShowModal({ ...showModal, edit: false })}
						products={perishableProducts}
						categories={categories}
						updateProducts={updateProducts}
					/>
				)}
			</Modal>

		</>
	)

}

export default PerishableProductsPage