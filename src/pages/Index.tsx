import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [area, setArea] = useState<string>('');
  const [finishType, setFinishType] = useState<string>('standard');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const prices = {
    economy: 15000,
    standard: 25000,
    premium: 45000,
    elite: 75000
  };

  const calculatePrice = () => {
    const areaNum = parseFloat(area);
    if (!isNaN(areaNum) && areaNum > 0) {
      const pricePerSqm = prices[finishType as keyof typeof prices];
      setCalculatedPrice(areaNum * pricePerSqm);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const portfolioItems = [
    {
      img: 'https://cdn.poehali.dev/projects/c18948a0-4773-449a-acb6-a4c9f858b197/files/4f64e06f-15f9-4a79-96fa-6932a40ab083.jpg',
      title: 'Пентхаус 240 м²',
      desc: 'Панорамные окна, мраморная отделка',
      details: 'Роскошный пентхаус с панорамными окнами на весь Новосибирск. Использованы премиальные материалы: итальянский мрамор Calacatta, паркет из тикового дерева, дизайнерская сантехника Gessi.',
      area: 240,
      finishType: 'elite',
      price: 18000000
    },
    {
      img: 'https://cdn.poehali.dev/projects/c18948a0-4773-449a-acb6-a4c9f858b197/files/66edd709-c005-43ae-9ace-6aceaf6a82d7.jpg',
      title: 'Кухня премиум',
      desc: 'Итальянская мебель, золотые акценты',
      details: 'Кухня-гостиная в стиле неоклассика. Итальянская мебель Scavolini, техника Miele, столешницы из кварцевого агломерата Caesarstone. Золотые акценты в фурнитуре и светильниках.',
      area: 45,
      finishType: 'premium',
      price: 2025000
    },
    {
      img: 'https://cdn.poehali.dev/projects/c18948a0-4773-449a-acb6-a4c9f858b197/files/94263044-6979-45e1-880f-883e7906c64a.jpg',
      title: 'Ванная комната',
      desc: 'Натуральный камень, SPA-зона',
      details: 'Ванная комната с SPA-зоной. Отделка натуральным мрамором и ониксом с подсветкой. Система хромотерапии, тропический душ, джакузи Jacuzzi. Полы с подогревом.',
      area: 18,
      finishType: 'elite',
      price: 1350000
    },
  ];

  const handleSubmitRequest = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/aeaa2455-cd4d-4dc9-adcf-04e079aad9f0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          area: parseFloat(area) || null,
          finishType: finishType,
          estimatedPrice: calculatedPrice,
          message: formData.message
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: 'Успешно!', description: 'Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.' });
        setRequestDialogOpen(false);
        setFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить заявку', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проблема с подключением к серверу', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Навигация */}
      <nav className="fixed top-0 w-full bg-primary/95 backdrop-blur-sm z-50 border-b border-accent/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-accent">Elite Renovation</h1>
            <div className="hidden md:flex gap-8 items-center">
              {['Главная', 'О компании', 'Портфолио', 'Услуги', 'Процесс', 'Отзывы', 'Контакты'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-sm text-primary-foreground hover:text-accent transition-colors"
                >
                  {item}
                </button>
              ))}
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-primary"
                onClick={() => window.location.href = '/auth'}
              >
                <Icon name="User" size={18} className="mr-2" />
                Войти
              </Button>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-accent">
                  <Icon name="Menu" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-primary border-accent/20">
                <div className="flex flex-col gap-6 mt-8">
                  {['Главная', 'О компании', 'Портфолио', 'Услуги', 'Процесс', 'Отзывы', 'Контакты'].map((item) => (
                    <button
                      key={item}
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-left text-lg text-primary-foreground hover:text-accent transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="главная" className="relative min-h-screen flex items-center justify-center pt-20">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(26, 31, 44, 0.7), rgba(26, 31, 44, 0.85)), url('https://cdn.poehali.dev/projects/c18948a0-4773-449a-acb6-a4c9f858b197/files/4f64e06f-15f9-4a79-96fa-6932a40ab083.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-6 z-10 text-center animate-fade-in">
          <h2 className="text-6xl md:text-7xl font-bold text-accent mb-6">
            Элитный ремонт
          </h2>
          <p className="text-2xl md:text-3xl text-primary-foreground mb-4">
            квартир в новостройках Новосибирска
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Создаём роскошные интерьеры премиум-класса с использованием эксклюзивных материалов
            и авторских дизайнерских решений
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent text-primary hover:bg-accent/90 text-lg px-8"
              onClick={() => scrollToSection('калькулятор')}
            >
              Рассчитать стоимость
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-primary text-lg px-8"
              onClick={() => scrollToSection('портфолио')}
            >
              Наши работы
            </Button>
          </div>
        </div>
      </section>

      {/* О компании */}
      <section id="о компании" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <h2 className="text-5xl font-bold text-primary mb-6">О компании</h2>
            <Separator className="w-24 mx-auto mb-8 bg-accent h-1" />
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Мы специализируемся на элитном ремонте квартир в новостройках Новосибирска более 12 лет.
              Наша команда объединяет опытных дизайнеров, архитекторов и строителей высочайшей квалификации.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                { icon: 'Award', value: '200+', label: 'Реализованных проектов' },
                { icon: 'Users', value: '50+', label: 'Специалистов в команде' },
                { icon: 'Clock', value: '12', label: 'Лет на рынке' },
              ].map((stat, idx) => (
                <Card key={idx} className="border-accent/20 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <Icon name={stat.icon} className="mx-auto mb-4 text-accent" size={48} />
                    <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Портфолио */}
      <section id="портфолио" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-5xl font-bold text-primary mb-6">Портфолио</h2>
            <Separator className="w-24 mx-auto mb-8 bg-accent h-1" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Каждый наш проект — это уникальное сочетание роскоши, функциональности и безупречного вкуса
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {portfolioItems.map((project, idx) => (
              <Card
                key={idx}
                onClick={() => setSelectedPortfolio(project)}
                className="overflow-hidden group cursor-pointer border-accent/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <Button className="bg-accent text-primary hover:bg-accent/90">
                      Подробнее
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">{project.title}</h3>
                  <p className="text-muted-foreground">{project.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section id="услуги" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-5xl font-bold text-primary mb-6">Услуги</h2>
            <Separator className="w-24 mx-auto mb-8 bg-accent h-1" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'Home', title: 'Дизайн-проект', desc: 'Авторский дизайн интерьера' },
              { icon: 'Hammer', title: 'Ремонт под ключ', desc: 'Полный цикл работ' },
              { icon: 'Palette', title: 'Отделка премиум', desc: 'Элитные материалы' },
              { icon: 'Lightbulb', title: 'Освещение', desc: 'Умные системы света' },
            ].map((service, idx) => (
              <Card
                key={idx}
                className="text-center p-6 border-accent/20 hover:border-accent hover:shadow-lg transition-all"
              >
                <Icon name={service.icon} className="mx-auto mb-4 text-accent" size={48} />
                <h3 className="text-xl font-bold text-primary mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Калькулятор */}
      <section id="калькулятор" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-5xl font-bold text-primary mb-6">Калькулятор стоимости</h2>
              <Separator className="w-24 mx-auto mb-8 bg-accent h-1" />
              <p className="text-lg text-muted-foreground">
                Рассчитайте предварительную стоимость ремонта вашей квартиры
              </p>
            </div>
            <Card className="border-accent/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Параметры ремонта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="area" className="text-base">
                    Площадь квартиры (м²)
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="Введите площадь"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base mb-3 block">Тип отделки</Label>
                  <RadioGroup value={finishType} onValueChange={setFinishType}>
                    {[
                      { value: 'economy', label: 'Эконом', price: '15 000' },
                      { value: 'standard', label: 'Стандарт', price: '25 000' },
                      { value: 'premium', label: 'Премиум', price: '45 000' },
                      { value: 'elite', label: 'Элит', price: '75 000' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 rounded-lg border border-accent/20 hover:bg-accent/5 cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-muted-foreground">{option.price} ₽/м²</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  onClick={calculatePrice}
                  className="w-full bg-accent text-primary hover:bg-accent/90 text-lg py-6"
                >
                  Рассчитать стоимость
                </Button>

                {calculatedPrice !== null && (
                  <div className="mt-6 p-6 bg-accent/10 rounded-lg border-2 border-accent animate-scale-in">
                    <p className="text-center text-muted-foreground mb-2">Предварительная стоимость:</p>
                    <p className="text-center text-4xl font-bold text-primary">
                      {calculatedPrice.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Процесс */}
      <section id="процесс" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-5xl font-bold text-primary mb-6">Процесс работы</h2>
            <Separator className="w-24 mx-auto mb-8 bg-accent h-1" />
          </div>
          <div className="max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Консультация', desc: 'Встреча с дизайнером, обсуждение пожеланий' },
              { step: '02', title: 'Дизайн-проект', desc: '3D-визуализация, подбор материалов' },
              { step: '03', title: 'Смета', desc: 'Детальный расчёт стоимости работ' },
              { step: '04', title: 'Ремонт', desc: 'Выполнение работ с контролем качества' },
              { step: '05', title: 'Сдача объекта', desc: 'Финальная приёмка и гарантия' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 mb-8 group">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-xl group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы */}
      <section id="отзывы" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-5xl font-bold text-primary mb-6">Отзывы клиентов</h2>
            <Separator className="w-24 mx-auto mb-8 bg-accent h-1" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Анна Петрова',
                text: 'Потрясающий результат! Квартира превратилась в настоящий дворец. Качество работ на высшем уровне.',
                rating: 5,
              },
              {
                name: 'Дмитрий Соколов',
                text: 'Профессиональная команда, точное соблюдение сроков. Очень доволен выбором подрядчика.',
                rating: 5,
              },
              {
                name: 'Елена Волкова',
                text: 'Дизайнеры учли все наши пожелания. Интерьер получился роскошным и функциональным.',
                rating: 5,
              },
            ].map((review, idx) => (
              <Card key={idx} className="border-accent/20 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Icon key={i} name="Star" className="text-accent fill-accent" size={20} />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{review.text}"</p>
                  <p className="font-bold text-primary">{review.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section id="контакты" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-5xl font-bold text-primary mb-6">Контакты</h2>
            <Separator className="w-24 mx-auto mb-8 bg-accent h-1" />
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Icon name="Phone" className="text-accent" size={24} />
                <a href="tel:+79995459383" className="text-xl text-primary hover:text-accent transition-colors">
                  +7 (999) 545-93-83
                </a>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Icon name="Clock" className="text-accent" size={24} />
                <p className="text-lg text-primary">Пн-Пт: 9:00 - 18:00</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Icon name="Mail" className="text-accent" size={24} />
                <a
                  href="mailto:info@elite-renovation.ru"
                  className="text-xl text-primary hover:text-accent transition-colors"
                >
                  info@elite-renovation.ru
                </a>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Icon name="MapPin" className="text-accent" size={24} />
                <p className="text-xl text-primary">Новосибирск, ул. Красный проспект, 1</p>
              </div>
            </div>
            <Button 
              className="mt-8 bg-accent text-primary hover:bg-accent/90 text-lg px-8 py-6"
              onClick={() => setRequestDialogOpen(true)}
            >
              Заказать звонок
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent font-bold text-xl mb-2">Elite Renovation</p>
          <p className="text-sm opacity-75">© 2024 Все права защищены</p>
        </div>
      </footer>

      {/* Portfolio Modal */}
      <Dialog open={!!selectedPortfolio} onOpenChange={() => setSelectedPortfolio(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPortfolio && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl text-primary">{selectedPortfolio.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={selectedPortfolio.img}
                  alt={selectedPortfolio.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <Card className="p-4 border-accent/20">
                    <p className="text-sm text-muted-foreground mb-1">Площадь</p>
                    <p className="text-2xl font-bold text-primary">{selectedPortfolio.area} м²</p>
                  </Card>
                  <Card className="p-4 border-accent/20">
                    <p className="text-sm text-muted-foreground mb-1">Тип отделки</p>
                    <p className="text-2xl font-bold text-primary capitalize">{selectedPortfolio.finishType}</p>
                  </Card>
                  <Card className="p-4 border-accent/20">
                    <p className="text-sm text-muted-foreground mb-1">Стоимость</p>
                    <p className="text-2xl font-bold text-primary">{selectedPortfolio.price.toLocaleString('ru-RU')} ₽</p>
                  </Card>
                </div>
                <p className="text-muted-foreground leading-relaxed">{selectedPortfolio.details}</p>
                <Button
                  className="w-full bg-accent text-primary hover:bg-accent/90"
                  onClick={() => {
                    setSelectedPortfolio(null);
                    setRequestDialogOpen(true);
                  }}
                >
                  Заказать похожий проект
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Form Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Оставить заявку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">ФИО *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ivan@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div>
              <Label htmlFor="message">Сообщение</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Расскажите о ваших пожеланиях..."
                rows={4}
              />
            </div>
            <Button
              className="w-full bg-accent text-primary hover:bg-accent/90"
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;