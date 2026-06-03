import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { SidebarBrand, SidebarNavList } from './Sidebar';
import { useAuth } from '../context/AuthContext';

/**
 * Drawer de navegación para mobile (< md). Reutiliza el brand + nav del Sidebar
 * de escritorio. Radix (vía ui/sheet) aporta focus-trap, cierre con Escape y scrim.
 * Se cierra al navegar a una ruta.
 */
export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] p-0 gap-0">
        <SheetTitle className="sr-only">Navegación</SheetTitle>
        <SheetDescription className="sr-only">Menú de navegación principal de la plataforma.</SheetDescription>

        <div className="flex flex-col h-full bg-background">
          <SidebarBrand />
          <SidebarNavList onNavigate={close} />

          {user && (
            <div className="border-t border-sidebar-border shrink-0 p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/90 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-semibold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-sidebar-muted capitalize truncate">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
