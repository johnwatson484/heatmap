function getSafeRedirect (redirect: string): string {
  if (!redirect?.startsWith('/')) {
    return '/home'
  }
  return redirect
}

export { getSafeRedirect }
