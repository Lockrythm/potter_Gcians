import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Package, ShoppingCart, Compass } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/library', icon: BookOpen, label: 'Books' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: 'cart', icon: ShoppingCart, label: 'Cart', isCart: true },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsOpen, itemCount } = useCart();

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.isCart) {
      setIsOpen(true);
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border/30 safe-area-inset-bottom shadow-lg"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = item.isCart ? false : isActive(item.path);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item)}
              whileTap={{ scale: 0.85 }}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <motion.div 
                className="relative"
                animate={active ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 500, 
                  damping: 25,
                  mass: 0.8
                }}
              >
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-full bg-primary/20 -m-2",
                    active ? "opacity-100" : "opacity-0"
                  )}
                  animate={active ? { scale: 1.5, opacity: 0.3 } : { scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                />
                <Icon className="h-5 w-5 relative z-10" />
                
                {item.isCart && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.div>

              <motion.span 
                className="text-[10px] font-medium"
                animate={active ? { fontWeight: 600 } : { fontWeight: 500 }}
              >
                {item.label}
              </motion.span>

              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-1 w-6 h-1 rounded-full bg-primary"
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 30,
                    mass: 0.8
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
