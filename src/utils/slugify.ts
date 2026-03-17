export async function generateUniqueSlug(
  name: string,
  model: any,
  transaction?: any,
): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  let slug = baseSlug;
  let counter = 1;

  while (
    await model.findOne({
      where: { slug },
      transaction,
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
