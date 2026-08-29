// Estilos compartidos de los campos de formulario dentro de las hojas
// modales. Input y SelectTrigger pasan por tailwind-merge, así que agregar
// un ancho después (ej. `${inputCls} w-24`) sobrescribe el de aquí.
export const inputCls =
  "h-12 rounded-md border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-foreground transition-colors px-4";

export const triggerCls =
  "h-12 data-[size=default]:h-12 w-full rounded-md border-border bg-muted text-foreground text-sm px-4 justify-between focus:ring-0 focus-visible:ring-0 focus:border-foreground";
