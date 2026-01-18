import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
}

interface Request {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  area: number | null;
  finishType: string;
  estimatedPrice: number | null;
  message: string;
  status: string;
  createdAt: string;
}

const Cabinet = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadRequests(parsedUser.id);
  }, [navigate]);

  const loadRequests = async (userId: number) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/1ec907c0-d153-4a06-aff4-a89a4ef5952d?userId=${userId}`
      );
      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заявки',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      new: { label: 'Новая', variant: 'default' },
      processing: { label: 'В работе', variant: 'secondary' },
      completed: { label: 'Завершена', variant: 'outline' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-primary border-b border-accent/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-accent cursor-pointer" onClick={() => navigate('/')}>
              Elite Renovation
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground">{user.fullName}</span>
              <Button variant="outline" className="border-accent text-accent" onClick={handleLogout}>
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-primary mb-8">Личный кабинет</h2>

        <Tabs defaultValue="requests" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="requests">Мои заявки</TabsTrigger>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-primary">История заявок</h3>
                <Button className="bg-accent text-primary hover:bg-accent/90" onClick={() => navigate('/')}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Новая заявка
                </Button>
              </div>

              {isLoading ? (
                <p className="text-muted-foreground">Загрузка...</p>
              ) : requests.length === 0 ? (
                <Card className="border-accent/20">
                  <CardContent className="pt-6 text-center">
                    <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">У вас пока нет заявок</p>
                    <Button className="bg-accent text-primary hover:bg-accent/90" onClick={() => navigate('/')}>
                      Создать первую заявку
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {requests.map((request) => (
                    <Card key={request.id} className="border-accent/20 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">Заявка #{request.id}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(request.createdAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Площадь</p>
                            <p className="font-medium">
                              {request.area ? `${request.area} м²` : 'Не указана'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Тип отделки</p>
                            <p className="font-medium capitalize">
                              {request.finishType || 'Не указан'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Стоимость</p>
                            <p className="font-medium text-accent">
                              {request.estimatedPrice
                                ? `${request.estimatedPrice.toLocaleString('ru-RU')} ₽`
                                : 'Не рассчитана'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Телефон</p>
                            <p className="font-medium">{request.phone}</p>
                          </div>
                        </div>
                        {request.message && (
                          <div className="mt-4 pt-4 border-t border-accent/20">
                            <p className="text-sm text-muted-foreground mb-1">Сообщение</p>
                            <p className="text-sm">{request.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-accent/20 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Личные данные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">ФИО</Label>
                  <Input id="name" value={user.fullName} disabled className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" value={user.phone || 'Не указан'} disabled className="mt-2" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Для изменения данных свяжитесь с нашим менеджером:
                  </p>
                  <p className="text-sm">
                    <a href="tel:+79995459383" className="text-accent hover:underline font-medium">
                      +7 (999) 545-93-83
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Пн-Пт: 9:00 - 18:00
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Cabinet;