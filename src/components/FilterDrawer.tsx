import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface FilterDrawerProps {
  selectedCategory: string;
  selectedCondition: string;
  selectedType: string;
  onCategoryChange: (category: string) => void;
  onConditionChange: (condition: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
}

export function FilterDrawer({
  selectedCategory,
  selectedCondition,
  selectedType,
  onCategoryChange,
  onConditionChange,
  onTypeChange,
  onClearFilters,
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { categories, loading } = useCategories();

  const activeFiltersCount = [selectedCategory, selectedCondition, selectedType].filter(Boolean).length;

  const conditions = ['New', 'Used'];
  const types = [
    { value: 'buy', label: 'Buy' },
    { value: 'rent', label: 'Rent' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="magical-filter-button relative group border-secondary/50 hover:border-secondary hover:bg-secondary/10"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.2 }}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2 text-secondary" />
          </motion.div>
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-secondary text-secondary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
          <motion.span
            className="absolute inset-0 rounded-md"
            initial={false}
            whileHover={{
              boxShadow: '0 0 15px hsl(var(--secondary) / 0.3)',
            }}
          />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[400px] bg-card border-l border-secondary/20">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-secondary" />
            Magical Filters
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Categories
              </h3>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      className="flex items-center space-x-3 cursor-pointer group"
                      whileHover={{ x: 4 }}
                      onClick={() => onCategoryChange(selectedCategory === category.name ? '' : category.name)}
                    >
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={selectedCategory === category.name}
                        className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                      />
                      <Label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm cursor-pointer group-hover:text-secondary transition-colors"
                      >
                        {category.name}
                      </Label>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-border/50" />

            {/* Condition */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Condition
              </h3>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <motion.div
                    key={condition}
                    className="flex items-center space-x-3 cursor-pointer group"
                    whileHover={{ x: 4 }}
                    onClick={() => onConditionChange(selectedCondition === condition ? '' : condition)}
                  >
                    <Checkbox
                      id={`cond-${condition}`}
                      checked={selectedCondition === condition}
                      className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                    />
                    <Label
                      htmlFor={`cond-${condition}`}
                      className="text-sm cursor-pointer group-hover:text-secondary transition-colors"
                    >
                      {condition}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Type */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Type
              </h3>
              <div className="space-y-2">
                {types.map((type) => (
                  <motion.div
                    key={type.value}
                    className="flex items-center space-x-3 cursor-pointer group"
                    whileHover={{ x: 4 }}
                    onClick={() => onTypeChange(selectedType === type.value ? '' : type.value)}
                  >
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={selectedType === type.value}
                      className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                    />
                    <Label
                      htmlFor={`type-${type.value}`}
                      className="text-sm cursor-pointer group-hover:text-secondary transition-colors"
                    >
                      {type.label}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border/50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-muted-foreground/30"
              onClick={() => {
                onClearFilters();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
