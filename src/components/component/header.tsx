'use client';
import React, { useContext } from "react";
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import AuthContext from "@/hooks/auth-context";
import { cn } from "@/lib/utils";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "../ui/navigation-menu";
export function Header() {

  const { logout, isLogged } = useContext(AuthContext);

  if (!isLogged) {
    return null;
  }

  return (
    <header className="flex items-center justify-between bg-[#604CC3] px-4 py-3 shadow-sm sm:px-6 text-primary-foreground">
      <div className="flex items-center gap-4">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6 fill-primary-foreground" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "hover:bg-transparent, bg-transparent")}>
                  Inicio
                </NavigationMenuLink>
              </Link>
              <Link href="/user/listView" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "hover:bg-transparent, bg-transparent")}>
                  Usuarios
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn("bg-transparent hover:bg-[#604CC3]")} >Proveedores</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <ListItem href="/proveedores/nuevo" title="Crear">
                    Ingresa los datos del proveedor
                  </ListItem>
                  <ListItem href="/proveedores/ver" title="Ver">
                    Visualiza los proveedores
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn("bg-transparent hover:bg-[#604CC3]")} >Clientes</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <ListItem href="/clientes/nuevo" title="Crear">
                    Ingresa los datos del cliente
                  </ListItem>
                  <ListItem href="/clientes/ver" title="Ver">
                    Visualiza los cliente
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn("bg-transparent hover:bg-[#604CC3]")} >Productos</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <ListItem href="/productos/nuevo" title="Crear">
                    Ingresa los datos del producto
                  </ListItem>
                  <ListItem href="/productos/ver/perecederos" title="Ver productos perecederos">
                    Visualiza los productos perecederos
                  </ListItem>
                  <ListItem href="/productos/ver/no-perecederos" title="Ver productos no perecederos">
                    Visualiza los productos no perecederos
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/lotes/ver" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "hover:bg-transparent, bg-transparent")}>
                  Lotes
                </NavigationMenuLink>
              </Link>
              </NavigationMenuItem>

          </NavigationMenuList>

        </NavigationMenu>

      </div>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="border-[#604CC3] bg-background text-[#604CC3]">
          <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-[#604CC3] text-[#604CC3]" />
          {isLogged ? "Online" : "Offline"}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
              <div
                className="flex items-center justify-center bg-gray-300 text-white rounded-full"
                style={{ width: 36, height: 36, fontSize: 18 }}
              >
                A
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

function CircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}


function MountainIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}
