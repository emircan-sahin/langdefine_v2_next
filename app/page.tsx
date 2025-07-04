'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Code,
  Palette,
  Smartphone
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="relative">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold gradient-text">LangDefine</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/documentation">
                  <Button variant="ghost">Documentation</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="gradient-text">AI-Powered</span>
              <br />
              Translation Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Create, manage, and deploy translations with the power of AI. 
              Streamline your internationalization workflow with intelligent suggestions and automated processes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose LangDefine?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built for modern development teams who need powerful, yet simple translation management.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Suggestions</CardTitle>
                  <CardDescription>
                    Get intelligent translation suggestions powered by advanced AI models.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Context-aware translations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Style consistency
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Industry-specific terminology
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Developer Friendly</CardTitle>
                  <CardDescription>
                    Built with modern development workflows in mind.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      RESTful API
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      SDKs for popular frameworks
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      CI/CD integration
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Enterprise Security</CardTitle>
                  <CardDescription>
                    Bank-level security for your translation data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      End-to-end encryption
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Role-based access control
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Audit trails
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Team Collaboration</CardTitle>
                  <CardDescription>
                    Work together seamlessly with your team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Real-time collaboration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Translation memory
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Version control
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Beautiful Interface</CardTitle>
                  <CardDescription>
                    Modern, intuitive design that just works.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Dark theme support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Responsive design
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Keyboard shortcuts
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Multi-Platform</CardTitle>
                  <CardDescription>
                    Access your translations from anywhere.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Web application
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Mobile responsive
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Offline support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who are already using LangDefine to manage their translations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/documentation">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      View Documentation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Globe className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold gradient-text">LangDefine</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <Link href="/documentation" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
} 