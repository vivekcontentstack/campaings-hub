'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { ArrowLeft, Calendar, Mail, User, Building, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import CampaignFilter from "@/components/campaign-filter"

interface Submission {
  title: string
  campaign_id: string
  data: {
    name?: string
    email?: string
    campaignTitle?: string
    campaignUrl?: string
    [key: string]: string | undefined
  }
  uid: string
  created_at: string
  updated_at: string
}

interface Campaign {
  title: string
  uid: string
  url: string
}

interface SubmissionsClientProps {
  campaigns: Campaign[]
  initialCampaignId?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SubmissionsClient({ campaigns, initialCampaignId }: SubmissionsClientProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState<string | undefined>(initialCampaignId)
  const [isContentstackWidget, setIsContentstackWidget] = useState(false)
  const [contentTypeValid, setContentTypeValid] = useState(true)
  const [hideFilter, setHideFilter] = useState(false)
  const [appSdk, setAppSdk] = useState<any>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);

  // Update campaignId when initialCampaignId prop changes (for standalone mode filtering)
  useEffect(() => {
    if (!hideFilter) {
      setCampaignId(initialCampaignId);
    }
  }, [initialCampaignId, hideFilter]);

  // Initialize Contentstack App SDK
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      setSdkInitialized(true); // Allow fetching in non-widget mode
      return;
    }

    // Dynamically import the SDK only in browser
    import('@contentstack/app-sdk').then((module) => {
      const ContentstackAppSdk = module.default;
      
      ContentstackAppSdk.init().then(function (appSdk: any) {
        console.log('Contentstack App SDK initialized successfully');
        setAppSdk(appSdk);
        setIsContentstackWidget(true);

        // Get content type and entry UID from different location types
        let contentTypeUid: string | undefined;
        let entryUid: string | undefined;

        // Try CustomField location
        if (appSdk?.location?.CustomField) {
          contentTypeUid = appSdk.location.CustomField.fieldConfig?.content_type_uid;
          entryUid = appSdk.location.CustomField.entry?.getData()?.uid;
          console.log('Location: CustomField');
        }
        
        // Try SidebarWidget location
        if (appSdk?.location?.SidebarWidget) {
          const entry = appSdk.location.SidebarWidget.entry;
          if (entry) {
            contentTypeUid = entry.content_type?.uid;
            entryUid = entry.getData()?.uid;
            console.log('Location: SidebarWidget');
          }
        }

        console.log('Content Type:', contentTypeUid);
        console.log('Entry UID:', entryUid);

        // Check if content type is "campaigns"
        if (contentTypeUid && contentTypeUid !== 'campaigns') {
          setContentTypeValid(false);
          setLoading(false);
          setSdkInitialized(true);
          return;
        }

        // If we have entry_uid, use it as campaign filter
        if (entryUid) {
          console.log('Using entry UID as campaign filter:', entryUid);
          setCampaignId(entryUid);
          setHideFilter(true);
        }

        setSdkInitialized(true);
      }).catch((err: Error) => {
        console.error('Failed to initialize Contentstack SDK:', err);
        // Continue as standalone page
        setIsContentstackWidget(false);
        setSdkInitialized(true);
      });
    }).catch((err) => {
      console.error('Failed to load Contentstack SDK:', err);
      // Continue as standalone page
      setIsContentstackWidget(false);
      setSdkInitialized(true);
    });
  }, []);


  // Fetch submissions - only after SDK initialization
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!contentTypeValid || !sdkInitialized) return

      setLoading(true)
      setError(null)

      try {
        const url = campaignId 
          ? `/api/get-submissions?campaign=${campaignId}`
          : '/api/get-submissions'

        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch submissions')
        }

        const data = await response.json()
        setSubmissions(data.submissions || [])
      } catch (err) {
        console.error('Error fetching submissions:', err)
        setError(err instanceof Error ? err.message : 'Failed to load submissions')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [campaignId, contentTypeValid, sdkInitialized])

  // Show error if not on campaigns content type
  if (!contentTypeValid) {
    return (
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Available</AlertTitle>
            <AlertDescription>
              This widget is only available on the <strong>campaigns</strong> content type.
              Current content type is not supported for submissions viewing.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          {!isContentstackWidget && (
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
          )}
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Form Submissions
          </h1>
          <p className="text-muted-foreground mb-4">
            {campaignId 
              ? hideFilter 
                ? 'Showing submissions for this campaign'
                : 'Filtered by selected campaign'
              : 'Showing all campaign submissions'
            }
          </p>

          {/* Campaign Filter Dropdown - hidden if entry_uid exists */}
          {!hideFilter && (
            <CampaignFilter 
              campaigns={campaigns} 
              selectedCampaignId={campaignId} 
            />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {hideFilter ? 'Campaign Submissions' : 'Total Submissions'}
                    </p>
                    <p className="text-3xl font-bold text-foreground">{submissions.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Campaigns</p>
                    <p className="text-3xl font-bold text-foreground">
                      {new Set(submissions.map(s => s.campaign_id)).size}
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Latest Submission</p>
                    <p className="text-sm font-semibold text-foreground">
                      {submissions.length > 0 
                        ? formatDate(submissions[0].created_at).split(',')[0]
                        : 'No submissions'
                      }
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Submissions List */}
            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground">
                  {hideFilter 
                    ? 'This campaign has no form submissions yet.'
                    : 'Form submissions will appear here once users start submitting forms.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.uid}
                    className="bg-card p-6 rounded-lg border hover:border-primary transition-colors"
                  >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {!hideFilter && (
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {submission.data.campaignTitle || 'Untitled Campaign'}
                          </h3>
                          {submission.data.campaignUrl && !isContentstackWidget && (
                            <Link href={submission.data.campaignUrl}>
                              <Button variant="ghost" size="sm">
                                View Campaign
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                        
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${hideFilter ? '' : 'mt-4'}`}>
                          {submission.data.name && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                <strong>Name:</strong> {submission.data.name}
                              </span>
                            </div>
                          )}
                          
                          {submission.data.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                <strong>Email:</strong> {submission.data.email}
                              </span>
                            </div>
                          )}
                          
                          {submission.data.company && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                <strong>Company:</strong> {submission.data.company}
                              </span>
                            </div>
                          )}
                          
                          {submission.data.job_title && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                <strong>Job Title:</strong> {submission.data.job_title}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Additional Fields */}
                        <div className="mt-4">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-primary hover:underline">
                              View all fields
                            </summary>
                            <div className="mt-2 p-4 bg-muted rounded-md">
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(submission.data, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground md:text-right">
                        <div className="flex items-center gap-2 md:justify-end mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(submission.created_at)}</span>
                        </div>
                        <div className="text-xs">
                          ID: {submission.uid}
                        </div>
                        {!hideFilter && (
                          <div className="text-xs mt-1">
                            Campaign: <code className="bg-muted px-1 py-0.5 rounded">{submission.campaign_id}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

