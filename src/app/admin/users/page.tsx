// OlimpoWEB-Frontend/src/app/admin/users/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundLogo from "@/components/BackgroundLogo";
import { toast } from "react-hot-toast";

// Tipo para los datos de usuario
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_admin: boolean;
  role: "user" | "admin";
  created_at: string;
  membership_type?: string;
  membership_start_date?: string;
  payment_date?: string;
}

const UsersPage = () => {
  const { user, isAdmin, loading, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [membershipTypes, setMembershipTypes] = useState([
    { id: "mensual_completo", name: "Mensual completo (musculación)" },
    { id: "kickboxing_2", name: "Kickboxing (2 días/semana)" },
    { id: "kickboxing_3", name: "Kickboxing (3 días/semana)" },
    { id: "personal_trainer", name: "Personal Trainer" },
  ]);

  // Verificar si el usuario está autenticado y es administrador
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, loading, router]);

  // Función para obtener usuarios (con useCallback para evitar recreaciones)
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      //  En un entorno real, esto sería una llamada a la API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      setUsers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
      toast.error("Error al cargar los usuarios");
      setUsers([]);
      setIsLoading(false);
    }
  }, [token]);

  // Cargar datos de usuarios
  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, fetchUsers]);
 
// Función para filtrar usuarios
  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Filtrar por término de búsqueda (nombre, apellido o email)
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  // Filtrar usuarios cuando cambian los filtros
  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  // Función para crear o actualizar un usuario
  const saveUser = async () => {
    if (
      !currentUser ||
      !currentUser.email ||
      !currentUser.first_name ||
      !currentUser.last_name
    ) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    // Validar contraseñas solo para nuevos usuarios
    if (!isEditing) {
      if (!password) {
        toast.error("La contraseña es requerida");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }

      if (!currentUser.membership_type) {
        toast.error("Por favor seleccione un tipo de membresía");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        // En un entorno real, esto sería una llamada a la API para actualizar
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(currentUser),
          }
        );
        const updatedUser = await response.json();

        // Simulamos la actualización
        const updatedUsers = users.map((u) =>
          u.id === currentUser.id ? ({ ...u, ...currentUser } as User) : u
        );

        setUsers(updatedUsers);
        toast.success("Usuario actualizado correctamente");
      } else {
        // En un entorno real, esto sería una llamada a la API para crear
        const userData = {
          ...currentUser,
          password: password,
          membership_type: currentUser.membership_type,
          membership_start_date:
            currentUser.membership_start_date || new Date().toISOString(),
          payment_date: currentUser.payment_date || new Date().toISOString(),
        };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          }
        );
        const newUser = await response.json();

        setUsers([...users, newUser]);
        toast.success("Usuario creado correctamente");
      }

      setShowUserModal(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      toast.error("Error al guardar el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar un usuario
  const deleteUser = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualiza la lista de usuarios eliminando el usuario borrado
      const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updatedUsers);

      toast.success("Usuario eliminado correctamente");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      toast.error("Error al eliminar el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para abrir el modal de edición
  const openEditModal = (user: User) => {
    setCurrentUser({ ...user });
    setPassword("");
    setConfirmPassword("");
    setIsEditing(true);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    openEditModal(user);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Función para abrir el modal de creación
  const openCreateModal = () => {
    setCurrentUser({
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "user",
      is_admin: false,
      membership_type: "",
      membership_start_date: new Date().toISOString().split("T")[0],
      payment_date: new Date().toISOString().split("T")[0],
    });
    setPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    setShowUserModal(true);
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || (isLoading && users.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackgroundLogo opacity={0.05} />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={openCreateModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar usuario
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nombre, apellido o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="roleFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por rol
            </label>
            <select
              id="roleFilter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading && users.length > 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Usuario
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contacto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rol
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha de registro
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phone || "No especificado"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            console.log(
                              `Navegando a detalle de usuario: /admin/users/${user.id}`
                            );
                            window.location.href = `/admin/users/${user.id}`;
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver detalle
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {searchTerm || roleFilter !== "all"
              ? "No hay resultados que coincidan con los filtros aplicados."
              : "No hay usuarios registrados."}
          </div>
        )}
      </div>

      {/* Botón para volver al panel */}
      <div className="mt-8">
        <button
          onClick={() => router.push("/admin")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Volver al Panel
        </button>
      </div>

      {/* Modal para eliminar usuario */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <span className="font-semibold">
                {userToDelete?.first_name} {userToDelete?.last_name}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar usuario */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-6">
              {isEditing ? "Editar usuario" : "Crear nuevo usuario"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={currentUser?.first_name || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        first_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={currentUser?.last_name || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        last_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={currentUser?.last_name || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        last_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={currentUser?.email || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                  required
                />
              </div>

              {!isEditing && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        id="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirmar Contraseña *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="membership_type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tipo de Membresía *
                    </label>
                    <select
                      id="membership_type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={currentUser?.membership_type || ""}
                      onChange={(e) =>
                        setCurrentUser({
                          ...currentUser,
                          membership_type: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Seleccionar membresía</option>
                      {membershipTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="membership_start_date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Fecha de inicio de membresía *
                      </label>
                      <input
                        type="date"
                        id="membership_start_date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={
                          currentUser?.membership_start_date ||
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            membership_start_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="payment_date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Fecha de pago *
                      </label>
                      <input
                        type="date"
                        id="payment_date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={
                          currentUser?.payment_date ||
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            payment_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={currentUser?.phone || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rol
                </label>
                <select
                  id="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={currentUser?.role || "user"}
                  onChange={(e) => {
                    const role = e.target.value as "user" | "admin";
                    setCurrentUser({
                      ...currentUser,
                      role: role,
                      is_admin: role === "admin",
                    });
                  }}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-2">* Campos requeridos</p>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setCurrentUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={saveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading
                  ? isEditing
                    ? "Actualizando..."
                    : "Creando..."
                  : isEditing
                  ? "Actualizar"
                  : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
