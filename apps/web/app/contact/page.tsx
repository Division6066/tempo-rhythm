"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// דף יצירת קשר: טופס לשליחת הודעות ופרטי התקשרות נוספים
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // biome-ignore lint/suspicious/noConsole: Demo purpose
    console.log("Contact form submitted:", formData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">צור קשר</h1>
        <p className="text-xl text-muted-foreground text-center mb-16">
          נשמח לשמוע ממך! מלא את הטופס ונחזור אליך בהקדם
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">שלח לנו הודעה</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      שם מלא *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="השם המלא שלך"
                      value={formData.name}
                      onChange={handleChange}
                      required={true}
                      className="text-lg py-5"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      אימייל *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required={true}
                      className="text-lg py-5"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      נושא *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="נושא הפנייה"
                      value={formData.subject}
                      onChange={handleChange}
                      required={true}
                      className="text-lg py-5"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      הודעה *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="ספר לנו איך נוכל לעזור..."
                      value={formData.message}
                      onChange={handleChange}
                      required={true}
                      rows={6}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full text-lg py-6">
                    שלח הודעה
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">פרטי התקשרות</h2>
              <p className="text-muted-foreground mb-8">
                ניתן ליצור קשר איתנו גם באמצעות הערוצים הבאים:
              </p>
            </div>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">אימייל</h3>
                    <p className="text-muted-foreground">support@temporhythm.app</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">טלפון</h3>
                    <p className="text-muted-foreground">support@temporhythm.app</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">כתובת</h3>
                    <p className="text-muted-foreground">ישראל</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">זמני תגובה</h3>
                <p className="text-muted-foreground text-sm">
                  אנו שואפים להגיב לכל פניה תוך 24 שעות בימי עבודה. בסופי שבוע וחגים, זמני התגובה
                  עשויים להיות ארוכים יותר.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-primary hover:underline">
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
