import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useEvaluation } from "../context/EvaluationContext";

import Button from "../components/ui/Button";
import TabsList from "../components/evaluations/TabsList";
import TabsTrigger from "../components/evaluations/TabsTrigger ";
import TabsContent from "../components/evaluations/TabsContent";
import ItemDetail from "../components/evaluations/ItemDetail";
import ItemCriteria from "../components/evaluations/ItemCriteria";
import Loader1 from "../components/loaders/Loader1";

const EvaluationItemForm = () => {
  const { itemId } = useParams(); // `undefined` si es nuevo
  const { selectedGroup, evaluationItems, updateEvaluationItems } =
    useEvaluation();
  const navigate = useNavigate();

  const [currentItemId, setCurrentItemId] = useState(itemId);
  const [activeTab, setActiveTab] = useState("details");
  const [item, setItem] = useState(false);
  const [itemCategory, setItemCategory] = useState(null); // "Evaluativa" o "Formativa"
  const [criteria, setCriteria] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        const categoriesURL = "/api/evaluationcategories";
        const itemURL = itemId ? `/api/evaluationitems/${itemId}` : null;
        const criteriaURL = itemId
          ? `/api/evaluationcriteria/item/${itemId}`
          : null;

        const [categoriesResponse, itemResponse, criteriaResponse] =
          await Promise.all([
            axios.get(categoriesURL),
            itemURL ? axios.get(itemURL) : Promise.resolve({ data: {} }),
            criteriaURL
              ? axios.get(criteriaURL)
              : Promise.resolve({ data: [] }),
          ]);

        setCategories(categoriesResponse.data);

        // Solo si hay itemId, actualizamos los datos relacionados con el item
        if (itemId) {
          setItem(itemResponse.data);
          setCriteria(criteriaResponse.data);
          setItemCategory(itemResponse.data.evaluationCategoryName);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationData();
  }, [itemId]);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  // Función para crear un nuevo ítem en modo borrador
  const createDraftItem = async () => {
    const itemData = {
      SectionAssignmentId: parseInt(selectedGroup),
      CreatedBy: 1,
    };
    const response = await axios.post("/api/evaluationitems/draft", itemData);
    console.log("Item creado en modo borrador");
    setCurrentItemId(response.data.evaluationItemId);
  };

  // Función para eliminar el ítem
  const deleteItem = async () => {
    const response = await axios.delete(
      `/api/evaluationitems/${currentItemId}`
    );
    const { status, statusText } = response;
    console.log(status, statusText);
  };

  // Función para manejar el cambio del checkbox
  const handleCheckboxChange = async (checked) => {
    if (checked) {
      if (!itemId) {
        await createDraftItem();
      }
    } else {
      if (!itemId) {
        await deleteItem();
        setCurrentItemId(undefined);
      }
    }
  };

  const handleChangeItem = async (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      handleCheckboxChange(checked);
    }

    setItem((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar el error para ese campo al cambiar el valor
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Limpiar el error del campo específico
    }));
  };

  const handleChangeCategory = (e) => {
    const selectedId = parseInt(e, 10);
    const selectedCategory = categories.find((c) => c.id === selectedId);

    setItem((prev) => ({
      ...prev,
      evaluationCategoryName: selectedCategory.name,
      categoryId: selectedCategory.id,
    }));

    setItemCategory(selectedCategory.name);

    setErrors((prevErrors) => ({
      ...prevErrors,
      category: "",
    }));
  };

  const validateCriteria = () => {
    let isValid = true;
    const errors = [];

    if (!Array.isArray(criteria) || criteria.length === 0) {
      errors.push("Debe agregar al menos un criterio.");
      return {
        isValid: false,
        errors,
      };
    }

    // Validación individual
    const totalPercentage = criteria.reduce((sum, criterion, index) => {
      const weight = parseInt(criterion.weight);
      const name = criterion.name?.trim();

      if (!name) {
        isValid = false;
        errors.push(`El criterio #${index + 1} no tiene nombre.`);
      }

      if (isNaN(weight) || weight <= 0) {
        isValid = false;
        errors.push(
          `El criterio "${
            criterion.name || `#${index + 1}`
          }" tiene un porcentaje inválido.`
        );
        return sum;
      }

      return sum + weight;
    }, 0);

    // Validación de suma total
    if (totalPercentage !== 100) {
      isValid = false;
      errors.push("La suma de los porcentajes debe ser exactamente 100%.");
    }

    return {
      isValid,
      errors,
    };
  };

  const validateItem = () => {
    let valid = true;
    let newErrors = {};

    if (!item.name || item.name.trim() === "") {
      newErrors.name = "El nombre es requerido.";
      valid = false;
    }

    item.percentage = parseInt(item.percentage);
    if (isNaN(item.percentage) || parseInt(item.percentage) <= 0) {
      newErrors.percentage = "El porcentaje debe ser un número positivo";
      valid = false;
    }

    if (!itemCategory || itemCategory.trim() === "") {
      newErrors.category = "La categoria es requerida.";
      valid = false;
    }

    if (!item.description || item.description.trim() === "") {
      newErrors.description = "La descripción es requerida.";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    item.percentage = parseInt(item.percentage);

    if (validateItem()) {
      const itemData = {
        SectionAssignmentId: parseInt(selectedGroup),
        Name: item.name,
        Description: item.description,
        CategoryId: item.categoryId,
        EvaluationCategoryName: item.evaluationCategoryName,
        Percentage: parseInt(item.percentage),
        HasCriteria: item.hasCriteria || false,
        CreatedBy: 1, // Actualizar con el ID real del usuario
        UpdatedBy: 1, // Actualizar con el ID real del usuario
      };

      if (itemData.HasCriteria) {
        const { isValid, errors } = validateCriteria();
        errors.forEach((err) => console.log(err));
        if (!isValid) return;

        itemData.Criteria = criteria;
      }

      if (currentItemId) {
        try {
          console.log(itemData);
          setLoading(true);
          const response = await axios.put(
            `/api/evaluationitems/${currentItemId}`,
            itemData
          );
          console.log(response);
          setItem(false);
          navigate("/calificaciones");
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        try {
          setLoading(true);
          const response = await axios.post("/api/evaluationitems/", itemData);
          const { data } = response;
          data.evaluationCategoryName = item.evaluationCategoryName;
          const updatedEvaluationItems = [...evaluationItems, data];
          updateEvaluationItems(updatedEvaluationItems);
          setItem(false);
          navigate("/calificaciones");
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  //? Gestión de criterios

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      { id: 0, evaluationItemId: parseInt(currentItemId), name: "", weight: 0 },
    ]);
  };

  const deleteCriterion = async (index) => {
    if (criteria[index].id !== 0) {
      console.log(criteria[index]);
      try {
        setLoading(true);
        const id = criteria[index].id;
        await axios.delete(`/api/evaluationcriteria/${id}`);
        setCriteria(criteria.filter((_, i) => i !== index));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: field === "weight" ? Number(value) : value,
    };
    setCriteria(newCriteria);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "", // Limpiar el error del campo específico
    }));
  };

  if (loading) {
    return <Loader1 />;
  }

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-2">
        <NavLink to="/calificaciones">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </NavLink>
        <h1 className="text-3xl font-bold tracking-tight">
          {itemId ? "Editar" : "Crear Nuevo" + " Ítem de Evaluación"}
        </h1>
      </section>

      <TabsList>
        <TabsTrigger
          value="details"
          isActive={activeTab === "details"}
          onClick={handleTabChange}
        >
          Detalles de la evaluación
        </TabsTrigger>
        <TabsTrigger
          value="criteria"
          isActive={activeTab === "criteria"}
          onClick={handleTabChange}
        >
          Rúbrica
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" activeTab={activeTab}>
        <ItemDetail
          item={item}
          handleChangeItem={handleChangeItem}
          itemCategory={itemCategory}
          handleChangeCategory={handleChangeCategory}
          categories={categories}
          handleSubmit={handleSubmit}
          handleTabChange={handleTabChange}
          errors={errors}
        />
      </TabsContent>

      <TabsContent value="criteria" activeTab={activeTab}>
        <ItemCriteria
          item={item}
          handleChangeItem={handleChangeItem}
          criteria={criteria}
          addCriterion={addCriterion}
          updateCriterion={updateCriterion}
          deleteCriterion={deleteCriterion}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      </TabsContent>
    </div>
  );
};

export default EvaluationItemForm;
