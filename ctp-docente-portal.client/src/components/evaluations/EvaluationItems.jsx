import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Edit, FileText, Plus, Settings, Trash2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import Button from "../ui/Button";
import { NavLink } from "react-router-dom";

import { useEvaluation } from "../../context/EvaluationContext";
import { formatDate } from "../../utils/gradeUtils";
import axios from "axios";
import Loader1 from "../loaders/Loader1";

const EvaluationItems = () => {
  const { evaluationItems, loading, setLoading, updateEvaluationItems } =
    useEvaluation();

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    category: "",
    percentage: 0,
    hasCriteria: false,
  });

  const editItem = (item) => {
    setNewItem(item);
    // console.log(newItem);
  };

  const deleteItem = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/evaluationitems/${id}`);

      const updateItems = [...evaluationItems].filter((ei) => ei.id !== id);

      updateEvaluationItems(updateItems);
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "formativa":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "sumativa":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "diagnóstica":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const totalWeight = evaluationItems.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  if (loading) {
    return <Loader1 />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Items de Evaluación</h2>
          <p>Gestiona los elementos que componen tus evaluaciones</p>
        </div>

        <div>
          <NavLink to="/item/nuevo">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Item
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Weight Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resumen de Pesos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Total de pesos asignados:</span>
            <Badge
              variant={totalWeight === 100 ? "default" : "destructive"}
              className="text-lg px-3 py-1 text-slate-200 bg-slate-500 dark:bg-slate-600"
            >
              {totalWeight}%
            </Badge>
          </div>
          {totalWeight !== 100 && (
            <p className="text-md mt-2">
              {totalWeight > 100
                ? "Los pesos exceden el 100%"
                : "Los pesos no suman 100%"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="grid gap-4">
        {evaluationItems.map((item) => (
          <Card key={item.id} className="p-4 ">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row items-center sm:items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <Badge
                      className={`text-xs ${getCategoryColor(
                        item.evaluationCategoryName
                      )}`}
                    >
                      {item.evaluationCategoryName}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.percentage}%
                    </Badge>
                    {item.hasCriteria && (
                      <Badge variant="secondary" className="text-xs">
                        Con Rúbrica
                      </Badge>
                    )}
                  </div>
                  <p>{item.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Creado: {formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.hasCriteria && (
                    <NavLink to={`/item/${item.id}/calificar`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </NavLink>
                  )}
                  <NavLink to={`/item/${item.id}/editar`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editItem(item)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </NavLink>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EvaluationItems;
