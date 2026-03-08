import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodSafeResolver } from "@/lib/zod-resolver";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceCategory, ListResponse } from "@/types";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  description: z.string().optional(),
  icon: z.string().optional(),
  basePrice: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) > 0),
      "Must be a positive number",
    ),
});
type FormData = z.infer<typeof schema>;

async function fetchCategories() {
  const res = await api.get<ListResponse<ServiceCategory>>("/admin/categories");
  return res.data.data;
}

function CategoryDialog({
  open,
  onClose,
  category,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  category: ServiceCategory | null;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodSafeResolver(schema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          icon: category.icon ?? "",
          basePrice: category.basePrice ?? "",
        }
      : { name: "", slug: "", description: "", icon: "", basePrice: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (category) await api.put(`/admin/categories/${category.id}`, data);
      else await api.post("/admin/categories", data);
      onSaved();
      onClose();
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "New category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                {...register("name")}
                className="h-9"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input
                {...register("slug")}
                className="h-9"
                placeholder="e.g. plumbing"
                aria-invalid={!!errors.slug}
              />
              {errors.slug && (
                <p className="text-xs text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Icon (emoji)</Label>
              <Input {...register("icon")} className="h-9" placeholder="🔧" />
            </div>
            <div className="space-y-1.5">
              <Label>Base price (₹)</Label>
              <Input
                {...register("basePrice")}
                type="number"
                className="h-9"
                placeholder="200"
                aria-invalid={!!errors.basePrice}
              />
              {errors.basePrice && (
                <p className="text-xs text-destructive">
                  {errors.basePrice.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              {...register("description")}
              className="min-h-16 resize-none"
              placeholder="Short description…"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-orange hover:bg-(--brand-orange)/90 text-white"
            >
              {loading && <Loader2 className="size-4 animate-spin mr-1" />}
              {category ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const {
    data: categories,
    isLoading,
    mutate,
  } = useSWR("/admin/categories", fetchCategories);

  const handleDelete = async (id: string) => {
    await api.delete(`/admin/categories/${id}`);
    mutate();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage service categories available on the platform
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-brand-orange hover:bg-(--brand-orange)/90 text-white shrink-0"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Add category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="hidden md:table-cell">
                  Base price
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(categories ?? []).map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-xl">{cat.icon ?? "🔧"}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-48">
                        {cat.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {cat.slug}
                    </code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {cat.basePrice
                      ? `₹${Number(cat.basePrice).toLocaleString("en-IN")}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditing(cat);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete "{cat.name}"?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This cannot be undone. Bookings for this category
                              will still exist.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cat.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        category={editing}
        onSaved={() => mutate()}
      />
    </div>
  );
}
