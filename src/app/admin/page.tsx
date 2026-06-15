'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { products as initialProducts, formatPrice } from '@/lib/products';
import { uploadMultipleImages } from '@/lib/upload';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Pencil, Trash2, Search, Package, DollarSign, ShoppingCart, TrendingUp, Upload, X, LogOut, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    compare_at_price: '',
    category_id: 'hombre',
    description: '',
    sku: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const filteredProducts = productList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalProducts: productList.length,
    totalValue: productList.reduce((sum, p) => sum + p.price, 0),
    categories: [...new Set(productList.map(p => p.category_id))].length,
    inStock: productList.filter(p => p.inventory_quantity > 0).length,
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: string[] = [];
    const newFiles: File[] = [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target?.result as string);
        if (newPreviews.length === files.length) {
          setPreviewImages(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
      newFiles.push(file);
    });

    setPendingFiles(prev => [...prev, ...newFiles]);
  };

  const removePreview = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let uploadedUrls: string[] = [];

    if (pendingFiles.length > 0) {
      uploadedUrls = await uploadMultipleImages(pendingFiles);
    }

    const existingImages = editingProduct?.images?.map(i => i.url) || [];
    const allUrls = [...existingImages, ...uploadedUrls];

    const images = allUrls.map((url, i) => ({
      id: `img-${Date.now()}-${i}`,
      product_id: editingProduct?.id || String(Date.now()),
      url,
      alt: formData.name,
      position: i,
      created_at: new Date().toISOString(),
    }));

    const newProduct: Product = {
      id: editingProduct?.id || String(Date.now()),
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      name: formData.name,
      description: formData.description,
      short_description: formData.description.slice(0, 60),
      price: Number(formData.price),
      compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
      cost_price: null,
      sku: formData.sku || `SKU-${Date.now()}`,
      barcode: null,
      track_inventory: false,
      inventory_quantity: 50,
      allow_backorder: false,
      weight: null,
      dimensions: null,
      images,
      category_id: formData.category_id,
      brand_id: null,
      tags: [formData.category_id],
      featured: false,
      status: 'active',
      seo_title: null,
      seo_description: null,
      created_at: editingProduct?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingProduct) {
      setProductList(list => list.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProductList(list => [...list, newProduct]);
    }

    setUploading(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : '',
      category_id: product.category_id,
      description: product.description,
      sku: product.sku,
    });
    setPreviewImages(product.images?.map(i => i.url).filter(Boolean) || []);
    setPendingFiles([]);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Eliminar este producto?')) {
      setProductList(list => list.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', compare_at_price: '', category_id: 'hombre', description: '', sku: '' });
    setEditingProduct(null);
    setPreviewImages([]);
    setPendingFiles([]);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Panel de Administración</h1>
          <p className="text-neutral-500 text-sm mt-1">Bienvenido, {user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg"><Package className="h-5 w-5 text-primary-600" /></div>
            <div>
              <p className="text-sm text-neutral-500">Productos</p>
              <p className="font-bold text-neutral-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-neutral-500">Inventario</p>
              <p className="font-bold text-neutral-900">{formatPrice(stats.totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><ShoppingCart className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-neutral-500">Categorías</p>
              <p className="font-bold text-neutral-900">{stats.categories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg"><TrendingUp className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-sm text-neutral-500">En Stock</p>
              <p className="font-bold text-neutral-900">{stats.inStock}</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Precio</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Precio anterior</label>
                  <input
                    type="number"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    placeholder="Opcional"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Auto-generado si está vacío"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Categoría</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Imágenes del Producto</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">Click para subir fotos</p>
                  <p className="text-xs text-neutral-400 mt-1">JPG, PNG hasta 5MB cada una</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {previewImages.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {previewImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200">
                        <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" type="button" onClick={resetForm}>Cancelar</Button>
                <Button type="submit" loading={uploading}>
                  {uploading ? 'Subiendo...' : editingProduct ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Foto</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{product.name}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{product.sku}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{product.category_id}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{formatPrice(product.price)}</span>
                    {product.compare_at_price && (
                      <span className="ml-2 text-xs text-neutral-400 line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.inventory_quantity > 0 ? 'success' : 'danger'}>
                      {product.inventory_quantity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-neutral-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}