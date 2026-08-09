export const SUBSCRIPTION_COPY = {
  en: {
    title: "Thanks for trying out my app!",
    subtitle: "Become a member to unlock the rest of the app",
    benefitsHeading: "Becoming a member grants you",
    benefitApps: "Full access to app and a language learning app",
    benefitContent: "A growing collection of coding, business, engineering, and investing education",
    benefitScholarships: "Support the mission to create scholarships with learning.",
    checkingPatreon: "Checking Patreon",
    notSubscribed: "We couldn't find an active paid membership for this Patreon account.",
    oauthError: "We couldn't connect your Patreon account. Please try again.",
    unavailable: "Patreon login is temporarily unavailable.",
  },
  es: {
    title: "¡Gracias por probar mi app!",
    subtitle: "Hazte miembro para desbloquear el resto de la app",
    benefitsHeading: "Al hacerte miembro obtienes",
    benefitApps: "Acceso completo a la app y a una app para aprender idiomas",
    benefitContent: "Una colección creciente de educación sobre programación, negocios, ingeniería e inversión",
    benefitScholarships: "Apoya la misión de crear becas mediante el aprendizaje.",
    checkingPatreon: "Comprobando Patreon",
    notSubscribed: "No encontramos una membresía de pago activa para esta cuenta de Patreon.",
    oauthError: "No pudimos conectar tu cuenta de Patreon. Inténtalo de nuevo.",
    unavailable: "El acceso con Patreon no está disponible temporalmente.",
  },
};

export const PATREON_FLOW_COPY = {
  en: {
    almostThere: "Almost there",
    finishTitle: "Finish subscribing on Patreon",
    finishBody: "After you subscribe, return to this page. Robots Building Education will verify your membership and unlock automatically.",
    openCheckout: "Open Patreon checkout",
    membershipTitle: "Membership",
    membershipPrice: "$10/mo",
    annualRecommended: "ANNUAL · 50% OFF",
    annualValue: "or $5/mo for annual subscriptions",
    membershipCta: "Subscribe with Patreon",
  },
  es: {
    almostThere: "Ya casi terminas",
    finishTitle: "Termina de suscribirte en Patreon",
    finishBody: "Después de suscribirte, regresa a esta página. Robots Building Education verificará tu membresía y se desbloqueará automáticamente.",
    openCheckout: "Abrir pago de Patreon",
    membershipTitle: "Membresía",
    membershipPrice: "$10/mes",
    annualRecommended: "ANUAL · 50% DE DESCUENTO",
    annualValue: "o $5/mes con la suscripción anual",
    membershipCta: "Suscribirse con Patreon",
  },
};

export const LEGACY_MIGRATION_COPY = {
  en: {
    eyebrow: "Existing member",
    title: "One quick update to keep your access",
    body: "We recognize that you previously unlocked Robots Building Education with a membership passcode. Connect the Patreon account tied to your membership to keep using the app.",
    reassurance: "You do not need a new subscription or another passcode.",
    connectAction: "Connect to Patreon",
  },
  es: {
    eyebrow: "Miembro existente",
    title: "Una actualización rápida para conservar tu acceso",
    body: "Reconocemos que anteriormente desbloqueaste Robots Building Education con un código de membresía. Conecta la cuenta de Patreon vinculada a tu membresía para seguir usando la app.",
    reassurance: "No necesitas una nueva suscripción ni otro código.",
    connectAction: "Conectar a Patreon",
  },
};

export const KEY_REPLACEMENT_COPY = {
  en: {
    eyebrow: "Membership access",
    title: "Replace your previous Robots Building Education key?",
    body: "This Patreon membership is already linked to another Robots Building Education key. You can move membership access to the key currently open in this app. The previous key will lose membership access.",
    reassurance: "Only membership access moves. Your learning data remains attached to each Robots Building Education key.",
    confirm: "Replace previous key",
    cancel: "Cancel",
    replacing: "Replacing key",
    failed: "We couldn't replace the linked key. Please restart Patreon login.",
    membershipInactive: "We couldn't find an active paid membership for this Patreon account.",
    unavailable: "Patreon is temporarily unavailable. Please try again.",
  },
  es: {
    eyebrow: "Acceso de membresía",
    title: "¿Reemplazar tu clave anterior de Robots Building Education?",
    body: "Esta membresía de Patreon ya está vinculada a otra clave de Robots Building Education. Puedes mover el acceso a la clave abierta actualmente en esta app. La clave anterior perderá el acceso.",
    reassurance: "Solo se mueve el acceso de membresía. Tus datos de aprendizaje permanecen vinculados a cada clave.",
    confirm: "Reemplazar clave anterior",
    cancel: "Cancelar",
    replacing: "Reemplazando clave",
    failed: "No pudimos reemplazar la clave vinculada. Reinicia el acceso con Patreon.",
    membershipInactive: "No encontramos una membresía de pago activa para esta cuenta de Patreon.",
    unavailable: "Patreon no está disponible temporalmente. Inténtalo de nuevo.",
  },
};

export const SETTINGS_COPY = {
  en: {
    tab: "Subscription", title: "Patreon subscription", active: "Active membership", inactive: "Membership inactive", paymentIssue: "Payment needs attention", unavailable: "Status temporarily unavailable", notLinked: "No Patreon account connected", stale: "Showing the last verified status while Patreon is unavailable.", lastChecked: "Last checked", entitlement: "Paid tier", connect: "Connect Patreon", reconnect: "Reconnect Patreon", manage: "Manage membership", payment: "Update payment", disconnect: "Disconnect Patreon", disconnectTitle: "Disconnect Patreon from this Robots Building Education key?", disconnectBody: "This removes app access from this key. It does not cancel Patreon billing.", cancel: "Cancel", confirm: "Disconnect", disconnecting: "Disconnecting",
  },
  es: {
    tab: "Suscripción", title: "Suscripción de Patreon", active: "Membresía activa", inactive: "Membresía inactiva", paymentIssue: "El pago necesita atención", unavailable: "Estado no disponible temporalmente", notLinked: "No hay una cuenta de Patreon conectada", stale: "Se muestra el último estado verificado mientras Patreon no está disponible.", lastChecked: "Última comprobación", entitlement: "Nivel de pago", connect: "Conectar Patreon", reconnect: "Reconectar Patreon", manage: "Administrar membresía", payment: "Actualizar pago", disconnect: "Desconectar Patreon", disconnectTitle: "¿Desconectar Patreon de esta clave de Robots Building Education?", disconnectBody: "Esto elimina el acceso de esta clave. No cancela la facturación de Patreon.", cancel: "Cancelar", confirm: "Desconectar", disconnecting: "Desconectando",
  },
};

export function patreonCopyFor(copy, language) {
  return copy[language === "es" ? "es" : "en"];
}
