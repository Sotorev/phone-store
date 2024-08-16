'use client';

import AuthContext from '@/hooks/auth-context';
import React, { useContext, useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useRouter } from 'next/navigation';

interface Sale {
  sale_id: string;
  date: string;
  total: number;
  user_id: string;
  is_active: 1 | 0;
}

const SalesPage: React.FC = () => {
	const { isLogged } = useContext(AuthContext);
	const [sales, setSales] = useState<Sale[]>([]);  // Array de ventas
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
		}

		fetch('http://localhost:3001/web/api/sales', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}` || '',
			},
		})
			.then((res) => res.json())
			.then((data: Sale[]) => {
				setSales(data);
			});
	}, []);

	if (!isLogged) {
		return null;
	}

	return (
		<>
			<Table>
				<TableCaption>Lista de ventas</TableCaption>
				<TableHeader>
					<TableRow>
                        <TableHead>ID de venta</TableHead>
						<TableHead className="w-[150px]">Fecha</TableHead>
						<TableHead>Total</TableHead>
						<TableHead>Usuario</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sales.length > 0 && sales
						.filter((sale) => sale.is_active === 1) // Filtrar solo las ventas activas
						.map((sale) => (
							<TableRow key={sale.sale_id}>
                                <TableCell>{sale.sale_id}</TableCell>
								<TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
								<TableCell>{sale.total}</TableCell>
								<TableCell>{sale.user_id}</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</>
	);
};

export default SalesPage;
