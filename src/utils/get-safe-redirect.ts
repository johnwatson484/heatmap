function getSafeRedirect (redirect: string): string {
  if (!redirect?.startsWith('/')) {
    return '/heatmap'
  }
  return redirect
}

export { getSafeRedirect }
