import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, User!</h1>
        <p className="text-lg text-gray-600">
          Your Findify scraper is actively tracking <span className="font-semibold text-blue-600">15 companies</span> and has discovered <span className="font-semibold text-blue-600">7 new internships</span> this week.
        </p>
      </div>

      {/* Key Metrics / Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Internship Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Internship Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>Total Internships Tracked: <span className="font-medium text-blue-600">125</span></p>
            <p>New Internships (Last 7 Days): <span className="font-medium text-blue-600">7</span></p>
            <p>Applied To: <span className="font-medium text-blue-600">12</span></p>
          </CardContent>
          <CardFooter>
            <Button>View All Internships</Button>
          </CardFooter>
        </Card>

        {/* Card 2: Scraper Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Scraper Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>Last Run: <span className="font-medium text-gray-800">Yesterday at 3:00 PM</span></p>
            <p>Next Scheduled Run: <span className="font-medium text-gray-800">Tomorrow at 9:00 AM</span></p>
            <p>Companies Tracked: <span className="font-medium text-blue-600">15</span></p>
            <p className="flex items-center">Status:
              <span className="ml-2 w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="ml-1 font-medium text-green-700">Active</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button>Run Scraper Now</Button>
          </CardFooter>
        </Card>

        {/* Card 3: Notifications & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>Last Alert: <span className="font-medium text-gray-800">Software Eng. Intern</span> at <span className="font-medium text-gray-800">Google</span> (2024-07-15 10:30)</p>
            <p>Unread Notifications: <span className="font-medium text-blue-600">3</span></p>
            <p className="flex items-center">Email Alerts:
              <span className="ml-2 w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="ml-1 font-medium text-green-700">On</span>
            </p>
            <p className="flex items-center">SMS Alerts:
              <span className="ml-2 w-3 h-3 rounded-full bg-gray-400 inline-block"></span>
              <span className="ml-1 font-medium text-gray-600">Off</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button>Manage Notifications</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions / Call to Action */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="mb-4">
          <p className="text-gray-700">Looking for something specific or want to add a new company?</p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Input placeholder="Search internships..." className="w-full sm:w-auto" />
          <Button variant="secondary">Add New Company</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
