import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Label } from "../ui/Label";
import Input from "../ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { NavLink } from "react-router-dom";
import Button from "../ui/Button";
import { Plus } from "lucide-react";

const ItemDetail = ({
  item,
  handleChangeItem,
  itemCategory,
  handleChangeCategory,
  categories,
  handleSubmit,
  handleTabChange,
  errors,
}) => {
  return (
    <Card>
      <CardHeader className="text-center md:text-start">
        <CardTitle>Información general</CardTitle>
        <CardDescription>
          Ingrese los detalles básicos de la evaluación
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <article className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Título de la evaluación</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Examen parcial I"
              defaultValue={item.name}
              onChange={handleChangeItem}
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-sm transition-colors">
                {errors.name}
              </p>
            )}
          </div>
        </article>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="space-y-2">
            <Label htmlFor="percentage">Valor porcentual</Label>
            <div className="flex">
              <Input
                id="percentage"
                name="percentage"
                type="number"
                min="0"
                max="100"
                placeholder="Ej: 25"
                defaultValue={item.percentage}
                onChange={handleChangeItem}
              />
              <span className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-muted">
                %
              </span>
            </div>
            {errors.percentage && (
              <p className="text-red-600 dark:text-red-400 text-sm transition-colors">
                {errors.percentage}
              </p>
            )}
          </article>
          <article className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={itemCategory ? itemCategory : ""}
              onValueChange={handleChangeCategory}
            >
              <SelectTrigger id="category" name="category">
                <SelectValue placeholder="Seleccionar Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-600 dark:text-red-400 text-sm transition-colors">
                {errors.category}
              </p>
            )}
          </article>
        </section>

        <article className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describa los detalles de la evaluación..."
            rows={4}
            defaultValue={item.description}
            onChange={handleChangeItem}
          />
          {errors.description && (
            <p className="text-red-600 dark:text-red-400 text-sm transition-colors">
              {errors.description}
            </p>
          )}
        </article>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row items-center md:items-start gap-4 justify-between">
        <NavLink to="/calificaciones">
          <Button variant="outline">Cancelar</Button>
        </NavLink>

        <Button variant="default" onClick={() => handleTabChange("criteria")}>
          <Plus className="h-4 w-4" />
          Añadir rúbricas
        </Button>

        <Button onClick={handleSubmit} className="-mt-1">
          Guardar y continuar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemDetail;
