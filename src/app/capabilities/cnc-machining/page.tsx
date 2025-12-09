import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

export default function CNCMachiningRedirect() {
  redirect(`/${defaultLocale}/capabilities/cnc-machining`);
}
