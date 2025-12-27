import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface BookFiltersProps {
  semester: string;
  subject: string;
  condition: string;
  type: string;
  onSemesterChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onClearFilters: () => void;
}

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const SUBJECTS = [
  'DBMS',
  'OS',
  'OOP',
  'DSA',
  'Networks',
  'AI',
  'Web Dev',
  'Math',
  'Physics',
  'English',
  'Other',
];
const CONDITIONS = ['New', 'Used'];
const TYPES = ['buy', 'rent'];

export function BookFilters({
  semester,
  subject,
  condition,
  type,
  onSemesterChange,
  onSubjectChange,
  onConditionChange,
  onTypeChange,
  onClearFilters,
}: BookFiltersProps) {
  const hasFilters = semester || subject || condition || type;

  return (
    <div className="flex flex-wrap gap-3 items-center mb-6 fade-in">
      {/* Semester Filter */}
      <Select value={semester} onValueChange={onSemesterChange}>
        <SelectTrigger className="w-[130px] bg-card">
          <SelectValue placeholder="Semester" />
        </SelectTrigger>
        <SelectContent>
          {SEMESTERS.map((sem) => (
            <SelectItem key={sem} value={sem}>
              Semester {sem}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subject Filter */}
      <Select value={subject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-[130px] bg-card">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          {SUBJECTS.map((subj) => (
            <SelectItem key={subj} value={subj}>
              {subj}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Condition Filter */}
      <Select value={condition} onValueChange={onConditionChange}>
        <SelectTrigger className="w-[130px] bg-card">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent>
          {CONDITIONS.map((cond) => (
            <SelectItem key={cond} value={cond}>
              {cond}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[130px] bg-card">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t === 'buy' ? 'Buy' : 'Rent'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
