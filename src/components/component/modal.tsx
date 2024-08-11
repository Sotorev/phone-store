import clsx from 'clsx';
import React from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	hideCloseButton?: boolean;
	className?: string;
}

const Modal = ({ isOpen, onClose, children, hideCloseButton, className}: ModalProps & { children: React.ReactNode }) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div className={clsx("fixed z-50 inset-0 overflow-y-auto")}>
			<div
				className="fixed inset-0 bg-black bg-opacity-50"
				onClick={onClose}
			></div>
			<div className="flex items-center justify-center min-h-screen">
				<div className={clsx("bg-white  rounded-lg p-4 max-w-md md:max-w-lg mx-auto relative shadow-md overflow-auto", className)}>
					{children}
					{!hideCloseButton && (
						<button
							onClick={onClose}
							className="text-red-500 float-right mt-2"
						>
							Cerrar
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Modal;