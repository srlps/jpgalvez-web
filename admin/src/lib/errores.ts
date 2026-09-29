export function mensajeError(error: unknown): string {
  const codigo = (error as { code?: string } | undefined)?.code ?? "";
  if (codigo.includes("permission-denied") || codigo === "storage/unauthorized") return "No tiene permisos para esta acción (revise las reglas de Firebase y el documento admins/{uid}).";
  if (codigo === "auth/invalid-credential" || codigo === "auth/wrong-password" || codigo === "auth/user-not-found") return "Correo o contraseña incorrectos.";
  if (codigo === "auth/too-many-requests") return "Demasiados intentos. Espere unos minutos e inténtelo de nuevo.";
  if (codigo === "failed-precondition") return "Falta desplegar un índice de Firestore (firebase deploy --only firestore:indexes).";
  return (error as Error | undefined)?.message ?? "Ocurrió un error inesperado.";
}
