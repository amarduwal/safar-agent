import { createWorker } from '../services/mongodb/workers';
import { searchEmployerIntelligence } from '../services/elastic/search';
import { sendTextMessage } from '../services/whatsapp/client';
import { sendRegistrationConfirmation as sendConfirmation } from '../services/whatsapp/messages';
import type { WorkerProfile } from '../types';
import { COUNTRY_NAMES, config } from '../config';

// In-memory state for multi-step registration (use Redis in production)
const registrationSessions = new Map<string, Partial<WorkerProfile> & { step: number }>();

export async function handleRegistrationFlow(phone: string, message: string): Promise<string> {
  const session = registrationSessions.get(phone) ?? { step: 0 };

  switch (session.step) {
    case 0: {
      // Start registration
      registrationSessions.set(phone, { ...session, step: 1, phone });
      return `नमस्ते! सफरमा स्वागत छ! 🙏\n\nतपाईंको पूरा नाम नेपालीमा लेख्नुहोस्:\n(Write your full name in Nepali)`;
    }

    case 1: {
      registrationSessions.set(phone, { ...session, step: 2, name: { ne: message, en: '' } });
      return `राम्रो, ${message}!\n\nतपाईंको परिवारको सम्पर्क नम्बर दिनुहोस् (Nepal):\nEx: 9841234567`;
    }

    case 2: {
      const familyPhone = message.replace(/\D/g, '');
      if (familyPhone.length < 10) return 'कृपया सही फोन नम्बर दिनुहोस् (10 digits)';
      registrationSessions.set(phone, { ...session, step: 3, familyPhone: `+977${familyPhone.slice(-10)}` });
      return `तपाईं कुन देशमा जाँदै हुनुहुन्छ?\n\n1. Qatar 🇶🇦\n2. UAE 🇦🇪\n3. Saudi Arabia 🇸🇦\n4. Malaysia 🇲🇾\n5. Kuwait 🇰🇼\n6. अन्य\n\nनम्बर टाइप गर्नुहोस्:`;
    }

    case 3: {
      const countryMap: Record<string, string> = { '1': 'QA', '2': 'AE', '3': 'SA', '4': 'MY', '5': 'KW' };
      const country = countryMap[message.trim()] ?? 'QA';
      registrationSessions.set(phone, {
        ...session,
        step: 4,
        destination: {
          country,
          countryName: COUNTRY_NAMES[country] ?? country,
          employer: '',
          sector: 'construction',
        },
      });
      return `कुन कम्पनीमा काम गर्नुहुन्छ?\nकम्पनीको नाम लेख्नुहोस्:`;
    }

    case 4: {
      const dest = session.destination!;
      dest.employer = message;
      registrationSessions.set(phone, { ...session, step: 5, destination: dest });
      return `कुन काम गर्नुहुन्छ?\n\n1. निर्माण (Construction)\n2. घरेलु काम (Domestic)\n3. होटल / रेष्टुरेन्ट\n4. कारखाना (Factory)\n5. अन्य\n\nनम्बर टाइप गर्नुहोस्:`;
    }

    case 5: {
      const sectorMap: Record<string, WorkerProfile['destination']['sector']> = {
        '1': 'construction', '2': 'domestic', '3': 'hospitality', '4': 'manufacturing',
      };
      const sector = sectorMap[message.trim()] ?? 'other';
      const dest = session.destination!;
      dest.sector = sector;
      registrationSessions.set(phone, { ...session, step: 6, destination: dest });
      return `तपाईंको Recruitment Agency को नाम:\n(Manpower agency name — थाहा नभए "थाहा छैन" लेख्नुहोस्)`;
    }

    case 6: {
      registrationSessions.set(phone, {
        ...session,
        step: 7,
        recruiter: { agencyName: message, dofeLicense: undefined },
      });
      return `कहिले जाँदै हुनुहुन्छ?\nमिति लेख्नुहोस् (DD/MM/YYYY):\nEx: 15/06/2026`;
    }

    case 7: {
      const [day, month, year] = message.split('/').map(Number);
      const departureDate = new Date(year, month - 1, day);
      const session7 = registrationSessions.get(phone)!;

      // Create worker
      const worker = await createWorker({
        name: session7.name!,
        phone,
        familyPhone: session7.familyPhone!,
        destination: session7.destination!,
        recruiter: session7.recruiter!,
        departureDate,
        status: 'pre-departure',
        checkInIntervalDays: 7,
      });

      registrationSessions.delete(phone);

      // Check employer reputation in background
      const employerCheck = await searchEmployerIntelligence(
        worker.destination.employer,
        worker.destination.country
      );

      // Confirm to worker
      await sendConfirmation(phone, worker.name.ne, worker.destination.countryName);

      // Notify family
      await sendTextMessage(
        worker.familyPhone,
        `सफरमा दर्ता भयो 🙏\n\n${worker.name.ne} (${worker.destination.countryName}) को दर्ता सम्पन्न।\nहरेक आइतबार Check-in आउनेछ।\n\nDashboard: ${config.dashboardUrl}/family`
      );

      const warningMsg = employerCheck.safetyScore < 60
        ? `\n\n⚠️ नोट: ${worker.destination.employer} बारे केही चिन्ता छ। जाँदा सावधान रहनुहोस्।`
        : '';

      return `दर्ता सम्पन्न! तपाईंको Dignity Passport बनेको छ।${warningMsg}\n\nहरेक आइतबार check-in गर्नुहोस्। समस्यामा आवाज सन्देश पठाउनुहोस्।`;
    }

    default:
      registrationSessions.delete(phone);
      return 'कृपया फेरि सुरु गर्नुहोस्।';
  }
}

export function isInRegistrationSession(phone: string): boolean {
  return registrationSessions.has(phone);
}

export function startRegistration(phone: string): void {
  registrationSessions.set(phone, { step: 0 });
}
