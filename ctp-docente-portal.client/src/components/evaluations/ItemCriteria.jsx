import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Label } from "../ui/Label";
import { Alert, AlertDescription, AlertTitle } from "../ui/Alert";
import { AlertCircle, Plus, Trash } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { NavLink } from "react-router-dom";

const ItemCriteria = ({
  item,
  handleChangeItem,
  criteria,
  addCriterion,
  updateCriterion,
  deleteCriterion,
  handleSubmit,
}) => {
  const totalPercentage = criteria
    ? criteria.reduce((sum, criterion) => sum + parseInt(criterion.weight), 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Definición de rúbrica</CardTitle>
        <CardDescription>
          Establezca los criterios de evaluación y sus porcentajes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasCriteria"
            name="hasCriteria"
            checked={item.hasCriteria}
            onChange={handleChangeItem}
          />
          <Label htmlFor="hasCriteria">
            ¿Deseas evaluar este ítem mediante criterios específicos?
          </Label>
        </div>

        {item.hasCriteria ? (
          <>
            {totalPercentage !== 100 && (
              <Alert
                variant={totalPercentage > 100 ? "destructive" : "warning"}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atención</AlertTitle>
                <AlertDescription>
                  {totalPercentage > 100
                    ? "El total de porcentajes excede el 100%. Ajuste los valores."
                    : `El total de porcentajes es ${
                        totalPercentage ? totalPercentage : 0
                      }%. Debe sumar 100%.`}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-4 md:items-end border-b-2 rounded md:border-0"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`criterion-${index}`}>Criterio</Label>
                    <Input
                      id={`criterion-${index}`}
                      defaultValue={criterion.name}
                      onChange={(e) =>
                        updateCriterion(index, "name", e.target.value)
                      }
                      placeholder="Ej: Conocimiento del tema"
                    />
                  </div>
                  <div className="md:w-32 space-y-2">
                    <Label htmlFor={`weight-${index}`}>Porcentaje</Label>
                    <div className="flex">
                      <Input
                        id={`weight-${index}`}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        defaultValue={criterion.weight}
                        onChange={(e) =>
                          updateCriterion(index, "weight", e.target.value)
                        }
                      />
                      <span className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-muted">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center md:justify-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCriterion(index)}
                      className="cursor-pointer bg-gray-950 md:bg-transparent"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addCriterion}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar criterio
              </Button>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted rounded-md">
              <span className="font-medium">Total</span>
              <span
                className={`font-bold ${
                  totalPercentage !== 100 ? "text-red-500" : ""
                }`}
              >
                {totalPercentage ? totalPercentage : 0}%
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Puedes evaluar este ítem sin usar criterios. Si deseas agregarlos,
            marca la casilla anterior.
          </p>
        )}
      </CardContent>
      {item.hasCriteria && (
        <CardFooter className="flex justify-between items-center">
          <NavLink to="/calificaciones">
            <Button variant="outline">Cancelar</Button>
          </NavLink>

          <Button onClick={handleSubmit}>Guardar y continuar</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ItemCriteria;
