'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import { uploadMultipleImages } from '@/lib/upload';
import { formatPrice, formatPriceBS } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Product, Department, Category, Banner } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Pencil, Trash2, Search, Package, DollarSign, Upload, X, LogOut, Building2, FolderTree, Image, RefreshCw, Settings, Phone, MapPin, Clock, Share2, Palette } from 'lucide-react';

type Tab = 'products' | 'departments' | 'categories' | 'banners' | 'settings';

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const { exchangeRate, lastUpdated, setExchangeRate, fetchBCVRate } = useSettings();
  const [manualRate, setManualRate] = useState(String(exchangeRate));
  const [fetchingRate, setFetchingRate] = useState(false);
  const { settings: siteSettings, updateSettings: updateSiteSettings } = useSiteSettings();
  const [siteForm, setSiteForm] = useState(siteSettings);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forms
  const [productForm, setProductForm] = useState({ name: '', price: '', compare_at_price: '', category_id: '', department_id: '', description: '', sku: '', inventory_quantity: '50', featured: false, sizes: '', colors: '' });
  const [departmentForm, setDepartmentForm] = useState({ name: '', description: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', department_id: '' });
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', link_url: '', button_text: 'Comprar Ahora', bg_color: '#c2410c', text_color: '#ffffff' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  useEffect(() => {
    setManualRate(String(exchangeRate));
  }, [exchangeRate]);

  const handleFetchBCV = async () => {
    setFetchingRate(true);
    const ok = await fetchBCVRate();
    setFetchingRate(false);
    if (!ok) alert('No se pudo obtener la tasa del BCV. Intente manualmente.');
  };

  const handleSaveManualRate = () => {
    const rate = parseFloat(manualRate);
    if (rate > 0) {
      setExchangeRate(rate);
    } else {
      alert('Ingrese una tasa valida');
    }
  };

  const loadAll = async () => {
    const [prods, deps, cats, bans] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('banners').select('*').order('sort_order'),
    ]);
    if (prods.data) setProducts(prods.data as Product[]);
    if (deps.data) setDepartments(deps.data as Department[]);
    if (cats.data) setCategories(cats.data as Category[]);
    if (bans.data) setBanners(bans.data as Banner[]);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }
  if (!user) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewImages(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
      setPendingFiles(prev => [...prev, file]);
    });
  };

  const removePreview = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setPreviewImages([]);
    setPendingFiles([]);
    setProductForm({ name: '', price: '', compare_at_price: '', category_id: '', department_id: '', description: '', sku: '', inventory_quantity: '50', featured: false, sizes: '', colors: '' });
    setDepartmentForm({ name: '', description: '' });
    setCategoryForm({ name: '', description: '', department_id: '' });
    setBannerForm({ title: '', subtitle: '', link_url: '', button_text: 'Comprar Ahora', bg_color: '#c2410c', text_color: '#ffffff' });
  };

  const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // ===================== PRODUCTS =====================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    let uploadedUrls: string[] = [];
    if (pendingFiles.length > 0) {
      uploadedUrls = await uploadMultipleImages(pendingFiles);
    }
    const existingImages = editingItem?.images || [];
    const newImages = uploadedUrls.map((url, i) => ({ id: `img-${Date.now()}-${i}`, url, alt: productForm.name, position: i }));
    const allImages = [...existingImages, ...newImages];

    const payload = {
      name: productForm.name,
      slug: slugify(productForm.name),
      description: productForm.description,
      short_description: productForm.description.slice(0, 60),
      price: Number(productForm.price),
      compare_at_price: productForm.compare_at_price ? Number(productForm.compare_at_price) : null,
      sku: productForm.sku || `SKU-${Date.now()}`,
      inventory_quantity: Number(productForm.inventory_quantity),
      category_id: productForm.category_id || null,
      department_id: productForm.department_id || null,
      images: allImages,
      sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      featured: productForm.featured,
      status: 'active' as const,
      updated_at: new Date().toISOString(),
    };

    if (editingItem) {
      await supabase.from('products').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() });
    }
    setUploading(false);
    resetForm();
    loadAll();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Eliminar este producto?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadAll();
  };

  // ===================== DEPARTMENTS =====================
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: departmentForm.name, slug: slugify(departmentForm.name), description: departmentForm.description, updated_at: new Date().toISOString() };
    if (editingItem) {
      await supabase.from('departments').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('departments').insert({ ...payload, active: true, sort_order: departments.length + 1, created_at: new Date().toISOString() });
    }
    resetForm();
    loadAll();
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Eliminar este departamento? Los productos asociados quedaran sin departamento.')) return;
    await supabase.from('departments').delete().eq('id', id);
    loadAll();
  };

  // ===================== CATEGORIES =====================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: categoryForm.name, slug: slugify(categoryForm.name), description: categoryForm.description, department_id: categoryForm.department_id || null, updated_at: new Date().toISOString() };
    if (editingItem) {
      await supabase.from('categories').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('categories').insert({ ...payload, active: true, sort_order: categories.length + 1, created_at: new Date().toISOString() });
    }
    resetForm();
    loadAll();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Eliminar esta categoria?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadAll();
  };

  // ===================== BANNERS =====================
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = editingItem?.image_url || '';
    if (pendingFiles.length > 0) {
      const urls = await uploadMultipleImages(pendingFiles);
      if (urls.length > 0) imageUrl = urls[0];
    }
    const payload = { ...bannerForm, image_url: imageUrl, updated_at: new Date().toISOString() };
    if (editingItem) {
      await supabase.from('banners').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('banners').insert({ ...payload, active: true, sort_order: banners.length + 1, created_at: new Date().toISOString() });
    }
    resetForm();
    loadAll();
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Eliminar este banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    loadAll();
  };

  const openEdit = (item: any, tab: Tab) => {
    setEditingItem(item);
    if (tab === 'products') {
      setProductForm({
        name: item.name, price: String(item.price), compare_at_price: item.compare_at_price ? String(item.compare_at_price) : '',
        category_id: item.category_id || '', department_id: item.department_id || '', description: item.description || '', sku: item.sku || '',
        inventory_quantity: String(item.inventory_quantity || 0), featured: item.featured || false,
        sizes: (item.sizes || []).join(', '), colors: (item.colors || []).join(', '),
      });
      setPreviewImages(item.images?.map((i: any) => i.url) || []);
    } else if (tab === 'departments') {
      setDepartmentForm({ name: item.name, description: item.description || '' });
    } else if (tab === 'categories') {
      setCategoryForm({ name: item.name, description: item.description || '', department_id: item.department_id || '' });
    } else if (tab === 'banners') {
      setBannerForm({ title: item.title, subtitle: item.subtitle || '', link_url: item.link_url || '', button_text: item.button_text || 'Comprar Ahora', bg_color: item.bg_color || '#c2410c', text_color: item.text_color || '#ffffff' });
      setPreviewImages(item.image_url ? [item.image_url] : []);
    }
    setShowForm(true);
  };

  const stats = {
    products: products.length,
    departments: departments.length,
    categories: categories.length,
    banners: banners.length,
    totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
    inStock: products.filter(p => (p.inventory_quantity || 0) > 0).length,
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'departments', label: 'Departamentos', icon: Building2 },
    { id: 'categories', label: 'Categorias', icon: FolderTree },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'settings', label: 'Configuracion', icon: Settings },
  ];

  const handleSaveSiteSettings = () => {
    updateSiteSettings(siteForm);
    alert('Configuracion guardada!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Panel de Administracion</h1>
          <p className="text-neutral-500 text-sm mt-1">Bienvenido, {user.email}</p>
        </div>
        <Button variant="outline" onClick={signOut}><LogOut className="h-4 w-4" /> Salir</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg"><Package className="h-5 w-5 text-primary-600" /></div>
            <div><p className="text-sm text-neutral-500">Productos</p><p className="font-bold text-neutral-900">{stats.products}</p></div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-neutral-500">Inventario</p><p className="font-bold text-neutral-900">{formatPrice(stats.totalValue)}</p></div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-sm text-neutral-500">Depts / Cats</p><p className="font-bold text-neutral-900">{stats.departments} / {stats.categories}</p></div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg"><Image className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-sm text-neutral-500">Banners</p><p className="font-bold text-neutral-900">{stats.banners}</p></div>
          </div>
        </div>
      </div>

      {/* Exchange Rate Panel */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-neutral-500">Tasa de Cambio BCV</p>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-xl text-neutral-900">1 USD = {exchangeRate} BS</span>
                {lastUpdated && (
                  <span className="text-xs text-neutral-400">
                    Actualizada: {new Date(lastUpdated).toLocaleString('es-VE')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleFetchBCV} loading={fetchingRate}>
              <RefreshCw className={`h-4 w-4 ${fetchingRate ? 'animate-spin' : ''}`} />
              Obtener del BCV
            </Button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={manualRate}
                onChange={e => setManualRate(e.target.value)}
                step="0.01"
                className="w-24 h-9 px-2 rounded-lg border border-neutral-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button size="sm" onClick={handleSaveManualRate}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); resetForm(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white shadow text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4" />
          {activeTab === 'products' && 'Nuevo Producto'}
          {activeTab === 'departments' && 'Nuevo Departamento'}
          {activeTab === 'categories' && 'Nueva Categoria'}
          {activeTab === 'banners' && 'Nuevo Banner'}
        </Button>
      </div>

      {/* ===================== MODAL FORM ===================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'products' && 'Producto'}
              {activeTab === 'departments' && 'Departamento'}
              {activeTab === 'categories' && 'Categoria'}
              {activeTab === 'banners' && 'Banner'}
            </h2>

            {/* PRODUCT FORM */}
            {activeTab === 'products' && (
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Precio</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Precio anterior</label>
                    <input type="number" value={productForm.compare_at_price} onChange={e => setProductForm({ ...productForm, compare_at_price: e.target.value })} placeholder="Opcional"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">SKU</label>
                    <input type="text" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} placeholder="Auto-generado"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Stock</label>
                    <input type="number" value={productForm.inventory_quantity} onChange={e => setProductForm({ ...productForm, inventory_quantity: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tallas (separadas por coma)</label>
                    <input type="text" value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} placeholder="Ej: S, M, L, XL"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Colores (separados por coma)</label>
                    <input type="text" value={productForm.colors} onChange={e => setProductForm({ ...productForm, colors: e.target.value })} placeholder="Ej: Negro, Dorado, Plata"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Departamento</label>
                  <select value={productForm.department_id} onChange={e => setProductForm({ ...productForm, department_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Sin departamento</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Categoria</label>
                  <select value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Sin categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Descripcion</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={productForm.featured} onChange={e => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                  <label htmlFor="featured" className="text-sm text-neutral-700">Producto destacado</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Imagenes</label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors">
                    <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Click para subir fotos</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                  {previewImages.length > 0 && (
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {previewImages.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removePreview(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" type="button" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" loading={uploading}>{editingItem ? 'Guardar' : 'Crear'}</Button>
                </div>
              </form>
            )}

            {/* DEPARTMENT FORM */}
            {activeTab === 'departments' && (
              <form onSubmit={handleSaveDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre</label>
                  <input type="text" value={departmentForm.name} onChange={e => setDepartmentForm({ ...departmentForm, name: e.target.value })} required
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Descripcion</label>
                  <textarea value={departmentForm.description} onChange={e => setDepartmentForm({ ...departmentForm, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" type="button" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit">{editingItem ? 'Guardar' : 'Crear'}</Button>
                </div>
              </form>
            )}

            {/* CATEGORY FORM */}
            {activeTab === 'categories' && (
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre</label>
                  <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Departamento padre</label>
                  <select value={categoryForm.department_id} onChange={e => setCategoryForm({ ...categoryForm, department_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Sin departamento</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Descripcion</label>
                  <textarea value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" type="button" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit">{editingItem ? 'Guardar' : 'Crear'}</Button>
                </div>
              </form>
            )}

            {/* BANNER FORM */}
            {activeTab === 'banners' && (
              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Titulo</label>
                  <input type="text" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} required
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subtitulo</label>
                  <input type="text" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Imagen del banner</label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors">
                    <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Click para subir imagen (1200x500 recomendado)</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  {previewImages.length > 0 && (
                    <div className="mt-3 relative rounded-lg overflow-hidden border border-neutral-200">
                      <img src={previewImages[0]} alt="" className="w-full h-40 object-cover" />
                      <button type="button" onClick={() => { setPreviewImages([]); setPendingFiles([]); }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"><X className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">URL de enlace</label>
                    <input type="text" value={bannerForm.link_url} onChange={e => setBannerForm({ ...bannerForm, link_url: e.target.value })} placeholder="/catalogo"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Texto del boton</label>
                    <input type="text" value={bannerForm.button_text} onChange={e => setBannerForm({ ...bannerForm, button_text: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Color de fondo</label>
                    <div className="flex gap-2">
                      <input type="color" value={bannerForm.bg_color} onChange={e => setBannerForm({ ...bannerForm, bg_color: e.target.value })}
                        className="h-10 w-10 rounded cursor-pointer" />
                      <input type="text" value={bannerForm.bg_color} onChange={e => setBannerForm({ ...bannerForm, bg_color: e.target.value })}
                        className="flex-1 h-10 px-3 rounded-lg border border-neutral-300 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Color de texto</label>
                    <div className="flex gap-2">
                      <input type="color" value={bannerForm.text_color} onChange={e => setBannerForm({ ...bannerForm, text_color: e.target.value })}
                        className="h-10 w-10 rounded cursor-pointer" />
                      <input type="text" value={bannerForm.text_color} onChange={e => setBannerForm({ ...bannerForm, text_color: e.target.value })}
                        className="flex-1 h-10 px-3 rounded-lg border border-neutral-300 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" type="button" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" loading={uploading}>{editingItem ? 'Guardar' : 'Crear'}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================== TABLES ===================== */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {activeTab === 'products' && (<>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">SKU</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Depto/Cat</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Foto</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Acciones</th>
                </>)}
                {activeTab === 'departments' && (<>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Descripcion</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Acciones</th>
                </>)}
                {activeTab === 'categories' && (<>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Departamento</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Acciones</th>
                </>)}
                {activeTab === 'banners' && (<>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Titulo</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Subtitulo</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Imagen</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Orden</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Acciones</th>
                </>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {/* PRODUCTS ROWS */}
              {activeTab === 'products' && products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{p.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{p.sku}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{departments.find(d => d.id === p.department_id)?.name || '-'}</Badge>
                    <Badge variant="secondary" className="ml-1">{categories.find(c => c.id === p.category_id)?.name || '-'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{formatPrice(p.price)}</span>
                    {p.compare_at_price && <span className="ml-2 text-xs text-neutral-400 line-through">{formatPrice(p.compare_at_price)}</span>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={(p.inventory_quantity || 0) > 0 ? 'success' : 'danger'}>{p.inventory_quantity || 0}</Badge></td>
                  <td className="px-4 py-3">
                    {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" /> :
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p, 'products')}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* DEPARTMENT ROWS */}
              {activeTab === 'departments' && departments.map(d => (
                <tr key={d.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{d.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{d.slug}</td>
                  <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">{d.description || '-'}</td>
                  <td className="px-4 py-3"><Badge variant={d.active ? 'success' : 'secondary'}>{d.active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(d, 'departments')}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDepartment(d.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* CATEGORY ROWS */}
              {activeTab === 'categories' && categories.map(c => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.slug}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{departments.find(d => d.id === c.department_id)?.name || '-'}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={c.active ? 'success' : 'secondary'}>{c.active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c, 'categories')}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* BANNER ROWS */}
              {activeTab === 'banners' && banners.map(b => (
                <tr key={b.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{b.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{b.subtitle || '-'}</td>
                  <td className="px-4 py-3">
                    {b.image_url ? <img src={b.image_url} alt="" className="w-20 h-10 rounded object-cover" /> :
                      <div className="w-20 h-10 bg-neutral-100 rounded" />}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{b.sort_order}</td>
                  <td className="px-4 py-3"><Badge variant={b.active ? 'success' : 'secondary'}>{b.active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(b, 'banners')}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBanner(b.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== SETTINGS TAB ===================== */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Configuracion del Sitio</h2>
            <Button onClick={handleSaveSiteSettings}>Guardar Cambios</Button>
          </div>

          {/* Contacto */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">Contacto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Telefono Principal</label>
                <input type="text" value={siteForm.phone1} onChange={e => setSiteForm({ ...siteForm, phone1: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Telefono Secundario</label>
                <input type="text" value={siteForm.phone2} onChange={e => setSiteForm({ ...siteForm, phone2: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Correo Electronico</label>
                <input type="email" value={siteForm.email} onChange={e => setSiteForm({ ...siteForm, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">WhatsApp</label>
                <input type="text" value={siteForm.whatsapp} onChange={e => setSiteForm({ ...siteForm, whatsapp: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Ubicacion */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">Ubicacion</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Direccion</label>
                <input type="text" value={siteForm.address} onChange={e => setSiteForm({ ...siteForm, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ciudad</label>
                <input type="text" value={siteForm.city} onChange={e => setSiteForm({ ...siteForm, city: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Estado / Region</label>
                <input type="text" value={siteForm.state} onChange={e => setSiteForm({ ...siteForm, state: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Pais</label>
                <input type="text" value={siteForm.country} onChange={e => setSiteForm({ ...siteForm, country: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL de Google Maps (opcional)</label>
                <input type="text" value={siteForm.mapUrl} onChange={e => setSiteForm({ ...siteForm, mapUrl: e.target.value })} placeholder="https://maps.google.com/..."
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">Horarios de Atencion</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Lunes a Viernes</label>
                <input type="text" value={siteForm.hoursWeek} onChange={e => setSiteForm({ ...siteForm, hoursWeek: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Sabado</label>
                <input type="text" value={siteForm.hoursSaturday} onChange={e => setSiteForm({ ...siteForm, hoursSaturday: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Domingo</label>
                <input type="text" value={siteForm.hoursSunday} onChange={e => setSiteForm({ ...siteForm, hoursSunday: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">Redes Sociales</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Facebook</label>
                <input type="text" value={siteForm.facebook} onChange={e => setSiteForm({ ...siteForm, facebook: e.target.value })} placeholder="https://facebook.com/..."
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Instagram</label>
                <input type="text" value={siteForm.instagram} onChange={e => setSiteForm({ ...siteForm, instagram: e.target.value })} placeholder="https://instagram.com/..."
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">TikTok</label>
                <input type="text" value={siteForm.tiktok} onChange={e => setSiteForm({ ...siteForm, tiktok: e.target.value })} placeholder="https://tiktok.com/..."
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Twitter / X</label>
                <input type="text" value={siteForm.twitter} onChange={e => setSiteForm({ ...siteForm, twitter: e.target.value })} placeholder="https://x.com/..."
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">YouTube</label>
                <input type="text" value={siteForm.youtube} onChange={e => setSiteForm({ ...siteForm, youtube: e.target.value })} placeholder="https://youtube.com/..."
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Mision y Vision */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">Mision y Vision</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Mision</label>
                <textarea value={siteForm.mission} onChange={e => setSiteForm({ ...siteForm, mission: e.target.value })} rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Vision</label>
                <textarea value={siteForm.vision} onChange={e => setSiteForm({ ...siteForm, vision: e.target.value })} rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Colores de Marca */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">Colores de Marca</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Color Primario</label>
                <div className="flex gap-2">
                  <input type="color" value={siteForm.primaryColor} onChange={e => setSiteForm({ ...siteForm, primaryColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                  <input type="text" value={siteForm.primaryColor} onChange={e => setSiteForm({ ...siteForm, primaryColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg border border-neutral-300 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Color Secundario</label>
                <div className="flex gap-2">
                  <input type="color" value={siteForm.secondaryColor} onChange={e => setSiteForm({ ...siteForm, secondaryColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                  <input type="text" value={siteForm.secondaryColor} onChange={e => setSiteForm({ ...siteForm, secondaryColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg border border-neutral-300 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Color de Acento</label>
                <div className="flex gap-2">
                  <input type="color" value={siteForm.accentColor} onChange={e => setSiteForm({ ...siteForm, accentColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                  <input type="text" value={siteForm.accentColor} onChange={e => setSiteForm({ ...siteForm, accentColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg border border-neutral-300 text-sm" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: siteForm.primaryColor }} />
                <span className="text-sm text-neutral-500">Primario</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: siteForm.secondaryColor }} />
                <span className="text-sm text-neutral-500">Secundario</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: siteForm.accentColor }} />
                <span className="text-sm text-neutral-500">Acento</span>
              </div>
            </div>
          </div>

          {/* Banner Promo */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">Banner Promo (Parte inferior de la Home)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Titulo</label>
                <input type="text" value={siteForm.promoTitle} onChange={e => setSiteForm({ ...siteForm, promoTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subtitulo</label>
                <input type="text" value={siteForm.promoSubtitle} onChange={e => setSiteForm({ ...siteForm, promoSubtitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Texto del Boton</label>
                <input type="text" value={siteForm.promoButtonText} onChange={e => setSiteForm({ ...siteForm, promoButtonText: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Link del Boton</label>
                <input type="text" value={siteForm.promoButtonLink} onChange={e => setSiteForm({ ...siteForm, promoButtonLink: e.target.value })} placeholder="/catalogo"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Color de Fondo</label>
                <div className="flex gap-2">
                  <input type="color" value={siteForm.promoBgColor} onChange={e => setSiteForm({ ...siteForm, promoBgColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                  <input type="text" value={siteForm.promoBgColor} onChange={e => setSiteForm({ ...siteForm, promoBgColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg border border-neutral-300 text-sm" />
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg border border-neutral-200" style={{ backgroundColor: siteForm.promoBgColor }}>
              <p className="text-white font-bold text-lg">{siteForm.promoTitle || 'Titulo del banner'}</p>
              <p className="text-white/80 text-sm">{siteForm.promoSubtitle || 'Subtitulo del banner'}</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-200">
            <Button onClick={handleSaveSiteSettings} size="lg">Guardar Todos los Cambios</Button>
          </div>
        </div>
      )}
    </div>
  );
}
