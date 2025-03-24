import { apiService } from './api.service';

export interface Membership {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'pending';
  price: number;
  days_per_week?: number;
  current_week_attendances?: number;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  attendance?: {
    id: string;
    user_id: string;
    check_in_time: string;
    membership_id?: string;
  };
  membership?: Membership;
  weeklyAttendances?: number;
}

class AttendanceService {
  /**
   * Registra una asistencia mediante el escaneo de QR
   */
  async checkIn(qrData: string): Promise<AttendanceResponse> {
    try {
      const response = await apiService.post('/attendance/check-in', { qrData });
      return response.data;
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      throw error;
    }
  }

  /**
   * Obtiene las asistencias semanales para una membresía específica
   */
  async getWeeklyAttendances(membershipId: string): Promise<number> {
    try {
      const response = await apiService.get(`/attendance/weekly/${membershipId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error al obtener asistencias semanales:', error);
      return 0;
    }
  }

  /**
   * Verifica si una membresía está por vencer (en los próximos 7 días)
   */
  isAboutToExpire(membership: Membership): boolean {
    const endDate = new Date(membership.end_date);
    const today = new Date();
    const daysUntilExpiration = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  }

  /**
   * Calcula los días restantes hasta el vencimiento de una membresía
   */
  getDaysUntilExpiration(membership: Membership): number {
    const endDate = new Date(membership.end_date);
    const today = new Date();
    return Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Calcula las asistencias restantes para la semana en membresías de Kickboxing
   */
  getRemainingWeeklyAttendances(membership: Membership): number {
    if (!membership.type.includes('KICKBOXING') || !membership.days_per_week) {
      return 0;
    }
    
    return membership.days_per_week - (membership.current_week_attendances || 0);
  }

  /**
   * Determina si el usuario puede asistir hoy según su tipo de membresía
   */
  canAttendToday(membership: Membership): boolean {
    // Si no es kickboxing o no tiene límite semanal, siempre puede asistir
    if (!membership.type.includes('KICKBOXING') || !membership.days_per_week) {
      return true;
    }
    
    // Si es kickboxing, verificar si no ha alcanzado el límite semanal
    return (membership.current_week_attendances || 0) < membership.days_per_week;
  }
}

export const attendanceService = new AttendanceService();
