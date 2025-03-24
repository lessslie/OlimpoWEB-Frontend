import React from 'react';

interface Membership {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'pending';
  days_per_week?: number;
  current_week_attendances?: number;
}

interface AttendanceNotificationProps {
  membership: Membership;
  showModal: boolean;
  onClose: () => void;
}

const AttendanceNotification: React.FC<AttendanceNotificationProps> = ({ 
  membership, 
  showModal, 
  onClose 
}) => {
  if (!showModal) return null;

  // Calcular días restantes hasta el vencimiento
  const daysUntilExpiration = Math.ceil(
    (new Date(membership.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determinar el tipo de mensaje basado en el tipo de membresía
  const isKickboxing = membership.type.includes('KICKBOXING');
  const isKickboxing2 = membership.type === 'KICKBOXING_2';
  const isKickboxing3 = membership.type === 'KICKBOXING_3';
  const isMonthly = membership.type === 'MONTHLY';
  
  // Calcular asistencias restantes para la semana (kickboxing)
  const weeklyAttendancesLeft = isKickboxing 
    ? (membership.days_per_week || 0) - (membership.current_week_attendances || 0)
    : 0;

  // Determinar el mensaje principal
  let title = 'Ingreso Exitoso';
  let message = 'Tu asistencia ha sido registrada correctamente.';
  let alertType = 'success';

  // Mensaje para membresías próximas a vencer (1 día)
  if (daysUntilExpiration === 1) {
    title = '¡Tu membresía vence mañana!';
    message = 'Recuerda renovar tu membresía para seguir disfrutando de nuestros servicios.';
    alertType = 'warning';
  }
  // Mensaje para kickboxing con límite de asistencias semanales
  else if (isKickboxing && weeklyAttendancesLeft > 0) {
    title = 'Asistencia Registrada';
    message = `Te quedan ${weeklyAttendancesLeft} ${weeklyAttendancesLeft === 1 ? 'entrada' : 'entradas'} esta semana según tu plan de ${isKickboxing2 ? '2' : '3'} veces por semana.`;
    alertType = 'info';
  }
  // Mensaje para kickboxing sin asistencias restantes
  else if (isKickboxing && weeklyAttendancesLeft === 0) {
    title = 'Límite de Asistencias Alcanzado';
    message = `Has alcanzado el límite de ${membership.days_per_week} asistencias semanales para tu plan de Kickboxing.`;
    alertType = 'warning';
  }
  // Mensaje para membresía mensual normal
  else if (isMonthly) {
    title = 'Ingreso Exitoso';
    message = 'Tu asistencia ha sido registrada correctamente.';
    alertType = 'success';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className={`mb-4 p-4 rounded-lg ${
          alertType === 'success' ? 'bg-green-100 text-green-800' :
          alertType === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p>{message}</p>
          
          {/* Información adicional sobre el vencimiento */}
          {daysUntilExpiration > 1 && daysUntilExpiration <= 7 && (
            <div className="mt-3 text-sm">
              <p>Tu membresía vence en {daysUntilExpiration} días.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Tipo de membresía: <span className="font-medium">{
                membership.type === 'MONTHLY' ? 'Mensual' :
                membership.type === 'KICKBOXING_2' ? 'Kickboxing 2/semana' :
                membership.type === 'KICKBOXING_3' ? 'Kickboxing 3/semana' :
                membership.type
              }</span>
            </p>
            <p className="text-sm text-gray-600">
              Vence: <span className="font-medium">{new Date(membership.end_date).toLocaleDateString()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceNotification;
