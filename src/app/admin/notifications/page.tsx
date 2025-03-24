'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BackgroundLogo from '@/components/BackgroundLogo';
import { apiService } from '@/services/api.service';
import { toast } from 'react-hot-toast';

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  content: string;
  variables: string[];
  subject?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  subject?: string;
  content: string;
  status: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  membershipId?: string;
  templateId?: string;
}

// Tipos de notificación
const notificationTypes = [
  { id: 'email', name: 'Email individual' },
  { id: 'whatsapp', name: 'WhatsApp individual' },
  { id: 'bulk-email', name: 'Email masivo' },
  { id: 'membership-expiration', name: 'Aviso de expiración de membresía' },
  { id: 'membership-renewal', name: 'Aviso de renovación de membresía' },
  { id: 'templates', name: 'Gestión de plantillas' },
  { id: 'logs', name: 'Registro de notificaciones' },
];

const AdminNotificationsPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [notificationType, setNotificationType] = useState('email');
  const [sending, setSending] = useState(false);
  
  // Estados para gestión de plantillas
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    description: '',
    type: 'EMAIL',
    content: '',
    variables: [] as string[],
    subject: '',
    isDefault: false,
  });
  const [templateFormMode, setTemplateFormMode] = useState<'create' | 'edit'>('create');
  const [variableInput, setVariableInput] = useState('');
  
  // Formulario para email individual
  const [emailForm, setEmailForm] = useState({
    email: '',
    subject: '',
    message: '',
    templateId: '',
  });
  
  // Formulario para WhatsApp individual
  const [whatsappForm, setWhatsappForm] = useState({
    phone: '',
    message: '',
    templateId: '',
  });
  
  // Formulario para email masivo
  const [bulkEmailForm, setBulkEmailForm] = useState({
    emails: [] as string[],
    subject: '',
    message: '',
    selectAll: false,
    templateId: '',
  });
  
  // Formulario para aviso de expiración
  const [expirationForm, setExpirationForm] = useState({
    email: '',
    name: '',
    expirationDate: new Date().toISOString().split('T')[0],
    membershipType: 'MONTHLY',
    templateId: '',
  });
  
  // Formulario para aviso de renovación
  const [renewalForm, setRenewalForm] = useState({
    email: '',
    name: '',
    newExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    membershipType: 'MONTHLY',
    templateId: '',
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      } else {
        fetchUsers();
        fetchTemplates();
      }
    }
  }, [user, isAdmin, loading, router]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiService.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('No se pudieron cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await apiService.get('/notifications/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      toast.error('No se pudieron cargar las plantillas');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));

    // Si se selecciona una plantilla, cargar su contenido
    if (name === 'templateId' && value) {
      const selectedTemplate = templates.find(t => t.id === value);
      if (selectedTemplate) {
        setEmailForm(prev => ({
          ...prev,
          subject: selectedTemplate.subject || prev.subject,
          message: selectedTemplate.content,
        }));
      }
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWhatsappForm(prev => ({ ...prev, [name]: value }));

    // Si se selecciona una plantilla, cargar su contenido
    if (name === 'templateId' && value) {
      const selectedTemplate = templates.find(t => t.id === value);
      if (selectedTemplate) {
        setWhatsappForm(prev => ({
          ...prev,
          message: selectedTemplate.content,
        }));
      }
    }
  };

  const handleBulkEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'selectAll') {
      setBulkEmailForm(prev => ({
        ...prev,
        selectAll: checked,
        emails: checked ? users.map(user => user.email) : [],
      }));
    } else {
      setBulkEmailForm(prev => ({ ...prev, [name]: value }));

      // Si se selecciona una plantilla, cargar su contenido
      if (name === 'templateId' && value) {
        const selectedTemplate = templates.find(t => t.id === value);
        if (selectedTemplate) {
          setBulkEmailForm(prev => ({
            ...prev,
            subject: selectedTemplate.subject || prev.subject,
            message: selectedTemplate.content,
          }));
        }
      }
    }
  };

  const handleEmailCheckboxChange = (email: string) => {
    setBulkEmailForm(prev => {
      const emails = [...prev.emails];
      if (emails.includes(email)) {
        const index = emails.indexOf(email);
        emails.splice(index, 1);
      } else {
        emails.push(email);
      }
      return { ...prev, emails, selectAll: emails.length === users.length };
    });
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExpirationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRenewalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRenewalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTemplateForm(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddVariable = () => {
    if (variableInput && !templateForm.variables.includes(variableInput)) {
      setTemplateForm(prev => ({ 
        ...prev, 
        variables: [...prev.variables, variableInput] 
      }));
      setVariableInput('');
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      content: template.content,
      variables: template.variables || [],
      subject: template.subject || '',
      isDefault: template.isDefault,
    });
    setTemplateFormMode('edit');
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      id: '',
      name: '',
      description: '',
      type: 'EMAIL',
      content: '',
      variables: [],
      subject: '',
      isDefault: false,
    });
    setTemplateFormMode('create');
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSending(true);
      
      const payload = {
        ...templateForm,
        variables: templateForm.variables,
      };
      
      let response;
      
      if (templateFormMode === 'create') {
        response = await apiService.post('/notifications/templates', payload);
        toast.success('Plantilla creada exitosamente');
      } else {
        response = await apiService.put(`/notifications/templates/${templateForm.id}`, payload);
        toast.success('Plantilla actualizada exitosamente');
      }
      
      // Actualizar la lista de plantillas
      await fetchTemplates();
      
      // Resetear el formulario
      handleNewTemplate();
      
    } catch (error) {
      console.error('Error al guardar plantilla:', error);
      toast.error('No se pudo guardar la plantilla');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
      try {
        await apiService.delete(`/notifications/templates/${id}`);
        toast.success('Plantilla eliminada exitosamente');
        
        // Actualizar la lista de plantillas
        await fetchTemplates();
        
        // Si la plantilla eliminada es la que está seleccionada, resetear el formulario
        if (selectedTemplate && selectedTemplate.id === id) {
          handleNewTemplate();
        }
      } catch (error) {
        console.error('Error al eliminar plantilla:', error);
        toast.error('No se pudo eliminar la plantilla');
      }
    }
  };

  const handleWhatsappSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya ingresado un número de teléfono y un mensaje
    if (!whatsappForm.phone || !whatsappForm.message) {
      toast.error('Por favor ingresa un número de teléfono y un mensaje');
      return;
    }
    
    try {
      setSending(true);
      
      // Formatear el número de teléfono (eliminar espacios, guiones, etc.)
      const formattedPhone = whatsappForm.phone.replace(/\D/g, '');
      
      // Construir la URL para la API de WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send/?phone=${formattedPhone}&text=${encodeURIComponent(whatsappForm.message)}&type=phone_number&app_absent=0`;
      
      // Abrir la URL en una nueva ventana
      window.open(whatsappUrl, '_blank');
      
      // Registrar el envío en el backend
      await apiService.post('/notifications/whatsapp', whatsappForm);
      
      toast.success('Mensaje de WhatsApp enviado exitosamente');
      
      // Resetear el formulario
      setWhatsappForm({ phone: '', message: '', templateId: '' });
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      toast.error('No se pudo enviar el mensaje de WhatsApp');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      let endpoint = '';
      let payload = {};
      
      switch (notificationType) {
        case 'email':
          endpoint = '/notifications/email';
          payload = emailForm;
          break;
        case 'bulk-email':
          endpoint = '/notifications/bulk-email';
          payload = {
            emails: bulkEmailForm.emails,
            subject: bulkEmailForm.subject,
            message: bulkEmailForm.message,
            templateId: bulkEmailForm.templateId
          };
          break;
        case 'membership-expiration':
          endpoint = '/notifications/membership-expiration';
          payload = expirationForm;
          break;
        case 'membership-renewal':
          endpoint = '/notifications/membership-renewal';
          payload = renewalForm;
          break;
      }
      
      await apiService.post(endpoint, payload);
      toast.success('Notificación enviada exitosamente');
      
      // Resetear formularios
      if (notificationType === 'email') {
        setEmailForm({ email: '', subject: '', message: '', templateId: '' });
      } else if (notificationType === 'bulk-email') {
        setBulkEmailForm({ emails: [], subject: '', message: '', selectAll: false, templateId: '' });
      }
      
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      toast.error('No se pudo enviar la notificación');
    } finally {
      setSending(false);
    }
  };

  if (loading || loadingUsers || loadingTemplates) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Notificaciones</h1>
        <button 
          onClick={() => router.push('/admin')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Volver al Panel
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Notificación
          </label>
          <select
            value={notificationType}
            onChange={(e) => setNotificationType(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border rounded-lg"
          >
            {notificationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Formulario para Email Individual */}
          {notificationType === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Destinatario
                </label>
                <input
                  type="email"
                  name="email"
                  value={emailForm.email}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={emailForm.subject}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Asunto del correo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={emailForm.message}
                  onChange={handleEmailChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plantilla
                </label>
                <select
                  name="templateId"
                  value={emailForm.templateId}
                  onChange={handleEmailChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleccione una plantilla</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Formulario para WhatsApp Individual */}
          {notificationType === 'whatsapp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  value={whatsappForm.phone}
                  onChange={handleWhatsappChange}
                  placeholder="+54 2304355852"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: +54 2304355852 (con código de país)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={whatsappForm.message}
                  onChange={handleWhatsappChange}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plantilla
                </label>
                <select
                  name="templateId"
                  value={whatsappForm.templateId}
                  onChange={handleWhatsappChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleccione una plantilla</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleWhatsappSubmit}
                  disabled={sending}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                      </svg>
                      Enviar por WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Formulario para Email Masivo */}
          {notificationType === 'bulk-email' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    name="selectAll"
                    checked={bulkEmailForm.selectAll}
                    onChange={handleBulkEmailChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="selectAll" className="ml-2 block text-sm text-gray-700">
                    Seleccionar todos los usuarios
                  </label>
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={bulkEmailForm.emails.includes(user.email)}
                        onChange={() => handleEmailCheckboxChange(user.email)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`user-${user.id}`} className="ml-2 block text-sm text-gray-700">
                        {user.name} ({user.email})
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {bulkEmailForm.emails.length} usuarios seleccionados
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  name="subject"
                  value={bulkEmailForm.subject}
                  onChange={handleBulkEmailChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Asunto del correo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={bulkEmailForm.message}
                  onChange={handleBulkEmailChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plantilla
                </label>
                <select
                  name="templateId"
                  value={bulkEmailForm.templateId}
                  onChange={handleBulkEmailChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleccione una plantilla</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Formulario para Aviso de Expiración */}
          {notificationType === 'membership-expiration' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Usuario
                </label>
                <input
                  type="email"
                  name="email"
                  value={expirationForm.email}
                  onChange={handleExpirationChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Usuario
                </label>
                <input
                  type="text"
                  name="name"
                  value={expirationForm.name}
                  onChange={handleExpirationChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Expiración
                </label>
                <input
                  type="date"
                  name="expirationDate"
                  value={expirationForm.expirationDate}
                  onChange={handleExpirationChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Membresía
                </label>
                <select
                  name="membershipType"
                  value={expirationForm.membershipType}
                  onChange={handleExpirationChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="QUARTERLY">Trimestral</option>
                  <option value="BIANNUAL">Semestral</option>
                  <option value="ANNUAL">Anual</option>
                  <option value="KICKBOXING">Kickboxing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plantilla
                </label>
                <select
                  name="templateId"
                  value={expirationForm.templateId}
                  onChange={handleExpirationChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleccione una plantilla</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Formulario para Aviso de Renovación */}
          {notificationType === 'membership-renewal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Usuario
                </label>
                <input
                  type="email"
                  name="email"
                  value={renewalForm.email}
                  onChange={handleRenewalChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Usuario
                </label>
                <input
                  type="text"
                  name="name"
                  value={renewalForm.name}
                  onChange={handleRenewalChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Fecha de Expiración
                </label>
                <input
                  type="date"
                  name="newExpirationDate"
                  value={renewalForm.newExpirationDate}
                  onChange={handleRenewalChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Membresía
                </label>
                <select
                  name="membershipType"
                  value={renewalForm.membershipType}
                  onChange={handleRenewalChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="QUARTERLY">Trimestral</option>
                  <option value="BIANNUAL">Semestral</option>
                  <option value="ANNUAL">Anual</option>
                  <option value="KICKBOXING">Kickboxing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plantilla
                </label>
                <select
                  name="templateId"
                  value={renewalForm.templateId}
                  onChange={handleRenewalChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleccione una plantilla</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Formulario para Gestión de Plantillas */}
          {notificationType === 'templates' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Gestión de Plantillas</h2>
              <p>Esta sección permite gestionar las plantillas de notificación.</p>
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={handleNewTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Nueva Plantilla
                </button>
                <div>
                  {selectedTemplate && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
                    >
                      Eliminar Plantilla
                    </button>
                  )}
                </div>
              </div>
              {selectedTemplate ? (
                <form onSubmit={handleTemplateSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Plantilla
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={templateForm.name}
                      onChange={handleTemplateChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción de la Plantilla
                    </label>
                    <textarea
                      name="description"
                      value={templateForm.description}
                      onChange={handleTemplateChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Plantilla
                    </label>
                    <select
                      name="type"
                      value={templateForm.type}
                      onChange={handleTemplateChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contenido de la Plantilla
                    </label>
                    <textarea
                      name="content"
                      value={templateForm.content}
                      onChange={handleTemplateChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border rounded-lg"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variables de la Plantilla
                    </label>
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        value={variableInput}
                        onChange={(e) => setVariableInput(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg mr-2"
                        placeholder="Ingrese una variable"
                      />
                      <button
                        type="button"
                        onClick={handleAddVariable}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Agregar Variable
                      </button>
                    </div>
                    <ul>
                      {templateForm.variables.map((variable) => (
                        <li key={variable} className="flex items-center py-1">
                          <span className="block text-sm text-gray-700">{variable}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariable(variable)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 ml-2"
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asunto de la Plantilla
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={templateForm.subject}
                      onChange={handleTemplateChange}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plantilla por Defecto
                    </label>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={templateForm.isDefault}
                      onChange={handleTemplateCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={sending}
                      className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        'Guardar Plantilla'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="text-xl font-bold mb-2">Plantillas Existentes</h3>
                  <ul>
                    {templates.map((template) => (
                      <li key={template.id} className="flex items-center py-1">
                        <span className="block text-sm text-gray-700">{template.name}</span>
                        <button
                          type="button"
                          onClick={() => handleSelectTemplate(template)}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 ml-2"
                        >
                          Editar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Formulario para Registro de Notificaciones */}
          {notificationType === 'logs' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Registro de Notificaciones</h2>
              <p>Esta sección muestra el registro de notificaciones enviadas.</p>
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/notifications/logs')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Ver Registro de Notificaciones
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={sending}
              className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Notificación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
