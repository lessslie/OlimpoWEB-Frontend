// OlimpoWEB-Frontend/src/app/admin/users/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

// Tipos para los datos
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_admin: boolean;
  role: "user" | "admin";
  created_at: string;
  has_routine?: boolean;
  routine?: string | null;
}

interface Membership {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "pending";
  price: number;
}

interface Attendance {
  id: string;
  check_in_time: string;
  membership_id?: string;
}

const UserDetailPage = ({ params }: { params: { id: string } }) => {
  const { user, isAdmin, loading, token } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "memberships" | "attendance" | "routine">("profile");
  "profile" | "memberships" | "attendance" | ("routine" > "profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User> | null>(null);
  const [showAllAttendances, setShowAllAttendances] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const attendancesPerPage = 20;
  const [hasRoutine, setHasRoutine] = useState(false);
  const [routineText, setRoutineText] = useState("");
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [routineExercises, setRoutineExercises] = useState<any[]>([]);
  const [currentExercise, setCurrentExercise] = useState<any>({
    id: "",
    name: "",
    sets: 0,
    reps: "",
    rest: "",
    notes: "",
    day: "Lunes",
    mediaUrl: "",
    mediaType: "image",
  });
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const [adminActiveDay, setAdminActiveDay] = useState("");

  // Función para obtener datos del usuario
  const fetchUserData = useCallback(async () => {
    if (!token || !params.id) {
      console.error("No hay token o ID de usuario para obtener datos");
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
      console.log(
        "Obteniendo datos del usuario:",
        `${baseUrl}/users/${params.id}`
      );
      const response = await fetch(`${baseUrl}/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Error en la respuesta:",
          response.status,
          response.statusText
        );
        throw new Error(
          `Error al obtener los datos del usuario: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Datos del usuario recibidos:", data);

      if (!data || !data.id) {
        console.error("Datos de usuario inválidos o vacíos:", data);
        toast.error("No se pudieron cargar los datos del usuario");
        setIsLoading(false);
        return;
      }

      // Actualiza el estado con los datos recibidos
      setUserData(data);
      setEditedUser(data);
      setHasRoutine(data.has_routine || false);
      setRoutineText(data.routine || "");
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar los datos del usuario:", error);
      toast.error("Error al cargar los datos del usuario");
      setIsLoading(false);
    }
  }, [token, params.id]);

  // Función para obtener membresías del usuario
  const fetchMemberships = useCallback(async () => {
    if (!token || !params.id) {
      console.error("No hay token o ID de usuario para obtener membresías");
      return;
    }

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
      console.log(
        "Obteniendo membresías del usuario:",
        `${baseUrl}/memberships/user/${params.id}`
      );
      const response = await fetch(`${baseUrl}/memberships/user/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Error en la respuesta de membresías:",
          response.status,
          response.statusText
        );
        throw new Error("Error al obtener las membresías del usuario");
      }

      const data = await response.json();
      console.log("Membresías recibidas:", data);

      // Actualiza el estado con los datos recibidos
      setMemberships(data);
    } catch (error) {
      console.error("Error al cargar las membresías:", error);
      toast.error("Error al cargar las membresías");
    }
  }, [token, params.id]);

  // Función para obtener asistencias del usuario
  const fetchAttendances = useCallback(async () => {
    if (!token || !params.id) {
      console.error("No hay token o ID de usuario para obtener asistencias");
      return;
    }

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
      console.log(
        "Obteniendo asistencias del usuario:",
        `${baseUrl}/attendance/user/${params.id}`
      );
      const response = await fetch(`${baseUrl}/attendance/user/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Error en la respuesta de asistencias:",
          response.status,
          response.statusText
        );
        throw new Error("Error al obtener las asistencias del usuario");
      }

      const data = await response.json();
      console.log("Asistencias recibidas:", data);

      // Ordenar las asistencias por fecha (más recientes primero)
      const sortedAttendances = data.sort(
        (a, b) =>
          new Date(b.check_in_time).getTime() -
          new Date(a.check_in_time).getTime()
      );

      // Actualiza el estado con las asistencias ordenadas
      setAttendances(sortedAttendances);
    } catch (error) {
      console.error("Error al cargar las asistencias:", error);
      toast.error("Error al cargar las asistencias");
    }
  }, [token, params.id]);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    console.log(
      "Verificando autenticación - loading:",
      loading,
      "user:",
      !!user,
      "isAdmin:",
      isAdmin
    );
    if (!loading) {
      if (!user) {
        console.log("No hay usuario autenticado, redirigiendo a /login");
        // router.push("/login");
        return;
      }

      if (!isAdmin) {
        console.log("Usuario no es admin, redirigiendo a /dashboard");
        // router.push("/dashboard");
        return;
      }

      console.log("Usuario autenticado y es admin, puede ver la página");

      // Si el usuario está autenticado y es admin, cargamos los datos
      if (params.id) {
        console.log("Iniciando carga de datos del usuario con ID:", params.id);
        fetchUserData();
        fetchMemberships();
        fetchAttendances();
      } else {
        console.error("No se proporcionó ID de usuario en los parámetros");
        router.push("/admin/users");
      }
    }
  }, [
    user,
    isAdmin,
    loading,
    params.id,
    router,
    fetchUserData,
    fetchMemberships,
    fetchAttendances,
  ]);

  // Función para guardar cambios en el perfil
  const saveUserChanges = async () => {
    if (!editedUser) return;

    setIsLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
      const response = await fetch(`${baseUrl}/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil");
      }

      const updatedUser = await response.json();

      // Actualiza el estado con los datos del usuario actualizado
      setUserData({ ...userData, ...updatedUser } as User);
      setShowEditModal(false);
      toast.success("Perfil actualizado correctamente");
      setIsLoading(false);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.error("Error al actualizar el perfil");
      setIsLoading(false);
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy", { locale: es });
  };

  // Función para formatear la hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: es });
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy, HH:mm", { locale: es });
  };

  // Obtener el color del estado de la membresía
  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Traducir el estado de la membresía
  const translateMembershipStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "expired":
        return "Vencida";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  // Función para guardar la rutina del usuario
  const saveRoutine = async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
      const response = await fetch(`${baseUrl}/users/${params.id}/routine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          routine: JSON.parse(routineText),
          has_routine: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al asignar la rutina");
      }

      const data = await response.json();

      // Actualiza el estado con los datos actualizados
      setUserData({
        ...userData,
        has_routine: true,
        routine: JSON.parse(routineText),
      });
      setHasRoutine(true);
      setShowRoutineModal(false);
      toast.success("Rutina asignada correctamente");
      setIsLoading(false);
    } catch (error) {
      console.error("Error al asignar la rutina:", error);
      toast.error("Error al asignar la rutina");
      setIsLoading(false);
    }
  };

  // Función para eliminar la rutina del usuario
  const deleteRoutine = async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
      const response = await fetch(`${baseUrl}/users/${params.id}/routine`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la rutina");
      }

      // Actualiza el estado después de eliminar la rutina
      setUserData({
        ...userData,
        has_routine: false,
        routine: null,
      });
      setHasRoutine(false);
      setRoutineText("");
      toast.success("Rutina eliminada correctamente");
      setIsLoading(false);
    } catch (error) {
      console.error("Error al eliminar la rutina:", error);
      toast.error("Error al eliminar la rutina");
      setIsLoading(false);
    }
  };
  // Función para inicializar la edición de rutina
  const initRoutineEdit = () => {
    setShowRoutineModal(true);
    try {
      if (userData?.routine) {
        const routineData =
          typeof userData.routine === "string"
            ? JSON.parse(userData.routine)
            : userData.routine;

        setRoutineExercises(Array.isArray(routineData) ? routineData : []);
        setRoutineText(JSON.stringify(routineData, null, 2));
      } else {
        setRoutineExercises([]);
        setRoutineText("[]");
      }
      setIsEditingRoutine(true);
    } catch (error) {
      console.error("Error al parsear la rutina:", error);
      setRoutineExercises([]);
      setRoutineText("[]");
    }
  };

  // Función para agregar o actualizar un ejercicio
  const saveExercise = () => {
    if (
      !currentExercise.name ||
      !currentExercise.sets ||
      !currentExercise.reps ||
      !currentExercise.rest ||
      !currentExercise.day
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    let updatedExercises;
    if (currentExercise.id) {
      // Actualizar ejercicio existente
      updatedExercises = routineExercises.map((ex) =>
        ex.id === currentExercise.id ? currentExercise : ex
      );
    } else {
      // Agregar nuevo ejercicio con ID único
      const newExercise = {
        ...currentExercise,
        id: Date.now().toString(),
      };
      updatedExercises = [...routineExercises, newExercise];
    }

    setRoutineExercises(updatedExercises);
    setRoutineText(JSON.stringify(updatedExercises, null, 2));
    resetExerciseForm();
  };

  // Función para editar un ejercicio existente
  const editExercise = (exercise: any) => {
    setCurrentExercise(exercise);
    setShowExerciseForm(true);
  };

  // Función para eliminar un ejercicio
  const deleteExercise = (id: string) => {
    const updatedExercises = routineExercises.filter((ex) => ex.id !== id);
    setRoutineExercises(updatedExercises);
    setRoutineText(JSON.stringify(updatedExercises, null, 2));
  };

  // Función para resetear el formulario de ejercicio
  const resetExerciseForm = () => {
    setCurrentExercise({
      id: "",
      name: "",
      sets: 0,
      reps: "",
      rest: "",
      notes: "",
      day: "Lunes",
      mediaUrl: "",
      mediaType: "image",
    });
    setShowExerciseForm(false);
  };

  // Función para duplicar un ejercicio en otro día
  const duplicateExercise = (exercise: any, targetDay: string) => {
    const newExercise = {
      ...exercise,
      id: Date.now().toString(),
      day: targetDay,
    };

    const updatedExercises = [...routineExercises, newExercise];
    setRoutineExercises(updatedExercises);
    setRoutineText(JSON.stringify(updatedExercises, null, 2));
    toast.success(`Ejercicio duplicado para el día ${targetDay}`);
  };

  // Renderizado condicional basado en el estado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-3">Verificando autenticación...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Si no hay usuario o no es admin, no renderizamos nada
    // La redirección ya se maneja en el useEffect
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-3">Cargando datos del usuario...</span>
      </div>
    );
  }

  // Si no hay userData, también muestra un spinner
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-3">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {userData.first_name} {userData.last_name}
          </h1>
          <p className="text-gray-600 mt-1">{userData.email}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Editar Perfil
          </button>
          <button
            onClick={() => router.push("/admin/users")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Volver a Usuarios
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("memberships")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "memberships"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Membresías
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "attendance"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Asistencias
          </button>
          <button
            onClick={() => setActiveTab("routine")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "routine"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Rutina
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Pestaña de perfil */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información personal
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Nombre completo
                    </p>
                    <p className="mt-1">
                      {userData.first_name} {userData.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Teléfono
                    </p>
                    <p className="mt-1">
                      {userData.phone || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información de la cuenta
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rol</p>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          userData.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {userData.role === "admin"
                          ? "Administrador"
                          : "Usuario"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Fecha de registro
                    </p>
                    <p className="mt-1">{formatDate(userData.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      ID de usuario
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{userData.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de actividad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Membresías activas
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {memberships.filter((m) => m.status === "active").length}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Total de asistencias
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {attendances.length}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Última asistencia
                  </p>
                  <p className="mt-1 text-sm">
                    {attendances.length > 0
                      ? formatDate(attendances[0].check_in_time)
                      : "Sin asistencias"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña de membresías */}
        {activeTab === "memberships" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Membresías</h3>
              <button
                onClick={() =>
                  router.push(`/admin/memberships/new?userId=${params.id}`)
                }
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Nueva membresía
              </button>
            </div>

            {memberships.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tipo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Periodo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberships.map((membership) => (
                      <tr key={membership.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {membership.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(membership.start_date)} -{" "}
                            {formatDate(membership.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMembershipStatusColor(
                              membership.status
                            )}`}
                          >
                            {translateMembershipStatus(membership.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${membership.price.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Este usuario no tiene membresías registradas.
              </div>
            )}
          </div>
        )}

        {/* Pestaña de asistencias */}
        {activeTab === "attendance" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Historial de asistencias
              </h3>
              <div>
                {!showAllAttendances && attendances.length > 10 && (
                  <button
                    onClick={() => setShowAllAttendances(true)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Ver todas las asistencias
                  </button>
                )}
                {showAllAttendances && (
                  <button
                    onClick={() => setShowAllAttendances(false)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Ver asistencias recientes
                  </button>
                )}
              </div>
            </div>

            {attendances.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Fecha
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Hora
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Membresía
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {showAllAttendances
                        ? attendances
                            .slice(
                              (currentPage - 1) * attendancesPerPage,
                              currentPage * attendancesPerPage
                            )
                            .map((attendance) => (
                              <tr
                                key={attendance.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {formatDate(attendance.check_in_time)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {formatTime(attendance.check_in_time)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {attendance.membership_id
                                      ? memberships.find(
                                          (m) =>
                                            m.id === attendance.membership_id
                                        )?.type || "No disponible"
                                      : "No asociada"}
                                  </div>
                                </td>
                              </tr>
                            ))
                        : attendances.slice(0, 10).map((attendance) => (
                            <tr
                              key={attendance.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatDate(attendance.check_in_time)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatTime(attendance.check_in_time)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {attendance.membership_id
                                    ? memberships.find(
                                        (m) => m.id === attendance.membership_id
                                      )?.type || "No disponible"
                                    : "No asociada"}
                                </div>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {showAllAttendances &&
                  attendances.length > attendancesPerPage && (
                    <div className="flex justify-center mt-6">
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Números de página */}
                        {Array.from({
                          length: Math.ceil(
                            attendances.length / attendancesPerPage
                          ),
                        }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === index + 1
                                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(
                                  attendances.length / attendancesPerPage
                                )
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(attendances.length / attendancesPerPage)
                          }
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage ===
                            Math.ceil(attendances.length / attendancesPerPage)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
              </>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Este usuario no tiene asistencias registradas.
              </div>
            )}
          </div>
        )}

        {/* Pestaña de rutina */}
        {activeTab === "routine" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Rutina de entrenamiento
              </h3>
              <div className="space-x-2">
                {hasRoutine ? (
                  <>
                    <button
                      onClick={initRoutineEdit}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Editar rutina
                    </button>
                    <button
                      onClick={deleteRoutine}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Eliminar rutina
                    </button>
                  </>
                ) : (
                  <button
                    onClick={initRoutineEdit}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Asignar rutina
                  </button>
                )}
              </div>
            </div>

            {hasRoutine ? (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-medium">Rutina actual:</h4>
                <div className="bg-white p-4 rounded border border-gray-200 whitespace-pre-wrap">
                  {JSON.stringify(userData?.routine, null, 2) ||
                    "No hay información disponible."}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Esta rutina está disponible para el usuario en su panel de
                    control.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p className="mb-4">
                  Este usuario no tiene una rutina asignada.
                </p>
                <p>
                  Puedes asignarle una rutina personalizada haciendo clic en el
                  botón Asignar rutina.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para editar perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Editar perfil
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={editedUser?.first_name || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, first_name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={editedUser?.last_name || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, last_name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={editedUser?.email || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>
                <input
                  type="text"
                  id="phone"
                  value={editedUser?.phone || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, phone: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rol
                </label>
                <select
                  id="role"
                  value={editedUser?.role || "user"}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      role: e.target.value as "user" | "admin",
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={saveUserChanges}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar/editar rutina */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {hasRoutine
                ? "Editar rutina de entrenamiento"
                : "Asignar rutina de entrenamiento"}
            </h3>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium">Ejercicios de la rutina</h4>
                <button
                  onClick={() => setShowExerciseForm(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Agregar ejercicio
                </button>
              </div>

              {/* Selector de días para filtrar ejercicios */}
              <div className="mb-4">
                <div className="flex space-x-1 overflow-x-auto pb-2">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      !adminActiveDay
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                    onClick={() => setAdminActiveDay("")}
                  >
                    Todos
                  </button>
                  {days.map((day) => (
                    <button
                      key={day}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        adminActiveDay === day
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                      onClick={() => setAdminActiveDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {routineExercises.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ejercicio
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Día
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Series x Reps
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Multimedia
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {routineExercises
                        .filter(
                          (exercise) =>
                            !adminActiveDay || exercise.day === adminActiveDay
                        )
                        .map((exercise) => (
                          <tr key={exercise.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {exercise.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Descanso: {exercise.rest}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {exercise.day}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {exercise.sets} x {exercise.reps}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {exercise.mediaUrl ? (
                                <div className="flex items-center">
                                  {exercise.mediaType === "image" ? (
                                    <Image
                                      src={exercise.mediaUrl}
                                      alt={`Demostración de ${exercise.name}`}
                                      width={40} // 40px porque h-10 en Tailwind es 2.5rem = 40px
                                      height={40} // mantenemos proporción cuadrada
                                      className="object-cover rounded"
                                    />
                                  ) : (
                                    <video
                                      src={exercise.mediaUrl}
                                      className="h-10 w-auto object-cover rounded"
                                    >
                                      Tu navegador no soporta videos HTML5.
                                    </video>
                                  )}
                                  <span className="ml-2 text-xs text-gray-500">
                                    {exercise.mediaType === "image"
                                      ? "Imagen"
                                      : "Video"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  No disponible
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => editExercise(exercise)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deleteExercise(exercise.id)}
                                className="text-red-600 hover:text-red-900 mr-3"
                              >
                                Eliminar
                              </button>
                              <div className="relative inline-block text-left">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdown =
                                      e.currentTarget.nextElementSibling;
                                    if (dropdown) {
                                      dropdown.classList.toggle("hidden");
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Duplicar
                                </button>
                                <div className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                  <div
                                    className="py-1"
                                    role="menu"
                                    aria-orientation="vertical"
                                  >
                                    {days
                                      .filter((d) => d !== exercise.day)
                                      .map((day) => (
                                        <button
                                          key={day}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateExercise(exercise, day);
                                            e.currentTarget
                                              .closest("div.py-1")
                                              ?.parentElement?.classList.add(
                                                "hidden"
                                              );
                                          }}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          role="menuitem"
                                        >
                                          Duplicar a {day}
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  No hay ejercicios en esta rutina. Haz clic en Agregar
                  ejercicio para comenzar.
                </div>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor="routineText"
                className="block text-sm font-medium text-gray-700"
              >
                JSON de la rutina (avanzado)
              </label>
              <textarea
                id="routineText"
                rows={8}
                value={routineText}
                onChange={(e) => {
                  setRoutineText(e.target.value);
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setRoutineExercises(Array.isArray(parsed) ? parsed : []);
                  } catch (error) {
                    // Error al parsear JSON, no actualizamos los ejercicios
                  }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              />
              <p className="mt-2 text-xs text-gray-500">
                Este es el formato JSON de la rutina. Puedes editarlo
                directamente si estás familiarizado con JSON, o utilizar la
                interfaz de arriba para una edición más sencilla.
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRoutineModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={saveRoutine}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Guardando..." : "Guardar rutina"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar ejercicio */}
      {showExerciseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentExercise.id ? "Editar ejercicio" : "Agregar ejercicio"}
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre del ejercicio
                </label>
                <input
                  type="text"
                  id="name"
                  value={currentExercise.name}
                  onChange={(e) =>
                    setCurrentExercise({
                      ...currentExercise,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="sets"
                  className="block text-sm font-medium text-gray-700"
                >
                  Series
                </label>
                <input
                  type="number"
                  id="sets"
                  value={currentExercise.sets}
                  onChange={(e) =>
                    setCurrentExercise({
                      ...currentExercise,
                      sets: parseInt(e.target.value, 10),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="reps"
                  className="block text-sm font-medium text-gray-700"
                >
                  Repeticiones
                </label>
                <input
                  type="text"
                  id="reps"
                  value={currentExercise.reps}
                  onChange={(e) =>
                    setCurrentExercise({
                      ...currentExercise,
                      reps: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="rest"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descanso
                </label>
                <input
                  type="text"
                  id="rest"
                  value={currentExercise.rest}
                  onChange={(e) =>
                    setCurrentExercise({
                      ...currentExercise,
                      rest: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="day"
                  className="block text-sm font-medium text-gray-700"
                >
                  Día
                </label>
                <select
                  id="day"
                  value={currentExercise.day}
                  onChange={(e) =>
                    setCurrentExercise({
                      ...currentExercise,
                      day: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="mediaUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL de multimedia (opcional)
                </label>
                <input
                  type="text"
                  id="mediaUrl"
                  value={currentExercise.mediaUrl}
                  onChange={(e) =>
                    setCurrentExercise({
                      ...currentExercise,
                      mediaUrl: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="mediaType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de multimedia (opcional)
                </label>
                <select
                  id="mediaType"
                  value={currentExercise.mediaType}
                  onChange={(e) =>
                    setCurrentExercise({
                      ...currentExercise,
                      mediaType: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={resetExerciseForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={saveExercise}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {currentExercise.id ? "Guardar cambios" : "Agregar ejercicio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailPage;
