// تحويل موحّد لبيانات المعلّم القادمة من الباك إند (TutorOut)
// إلى الشكل الذي تتوقعه واجهات الأدمن (مستخدم بأكثر من صفحة لتفادي تكرار نفس المنطق)
export function mapTutorToUI(tutor) {
  return {
    id: tutor.tutor_id,
    firstname: tutor.first_name,
    lastname: tutor.last_name,
    email: tutor.email,
    phone: tutor.phone_number,
    yearsExperience: tutor.total_experience_years ?? 0,
    submittedAt: tutor.registered_at ? tutor.registered_at.slice(0, 10) : '',
    verified: tutor.verified,
    is_banned: tutor.is_banned ?? false,
    banned_at: tutor.banned_at ?? null,
    subjects: (tutor.tutor_subjects || []).map((ts) => ({
      name: ts.subject?.subject_title || '—',
      years: ts.experience_years
    })),
    bio: tutor.bio || '',
    // ⚠️ الباك إند الحالي (TutorOut) لا يرجّع رابط الشهادات ضمن بيانات المعلّم،
    // لذلك هذا الحقل سيبقى فارغاً لحين إضافة الحقل من طرف الباك إند.
    certificates: [],
    teachingMethods: {
      online: tutor.tution_type === 'online' || tutor.tution_type === 'both',
      offline: tutor.tution_type === 'offline' || tutor.tution_type === 'both'
    },
    // ⚠️ الأسعار بالباك إند مرتبطة بكل مادة على حدة (price_per_hour ضمن tutor_subjects)
    // وليست "سعر موحّد لكل مرحلة" كما كان مفترضاً بالواجهات الأصلية (mock data).
    stagesPrices: (tutor.tutor_subjects || []).map((ts) => {
      const stageLabels = [
        ts.elementory_stage ? 'ابتدائي' : null,
        ts.middle_stage ? 'متوسط' : null,
        ts.high_stage ? 'ثانوي' : null
      ].filter(Boolean);

      return {
        stage: `${ts.subject?.subject_title || 'مادة'} (${stageLabels.join(' / ') || 'غير محدد'})`,
        price: ts.price_per_hour
      };
    })
  };
}
