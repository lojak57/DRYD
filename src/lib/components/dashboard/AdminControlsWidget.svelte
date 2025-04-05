<script lang="ts">
  import { jobStatusCounts } from '$lib/stores/jobStore';
  import { quoteStore } from '$lib/stores/quoteStore';
</script>

<div class="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
  <div class="p-4 bg-dryd-gradient text-white">
    <div class="flex justify-between items-center">
      <h2 class="font-bold text-xl flex items-center">
        <svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Admin Controls
      </h2>
    </div>
  </div>

  <div class="p-6 bg-gray-50">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- User Management Section -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-dryd-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          User Management
        </h3>
        <p class="text-gray-600 text-sm mb-4">Manage user accounts, roles, and permissions.</p>
        <a href="/admin/users" class="text-dryd-blue hover:text-dryd-blue-dark font-medium text-sm">Manage Users →</a>
      </div>

      <!-- System Settings Section -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-dryd-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          System Settings
        </h3>
        <p class="text-gray-600 text-sm mb-4">Configure system-wide settings and preferences.</p>
        <a href="/admin/settings" class="text-dryd-blue hover:text-dryd-blue-dark font-medium text-sm">Configure Settings →</a>
      </div>

      <!-- Reports Section -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-dryd-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Reports & Analytics
        </h3>
        <p class="text-gray-600 text-sm mb-4">Access business performance reports and analytics.</p>
        <a href="/admin/reports" class="text-dryd-blue hover:text-dryd-blue-dark font-medium text-sm">View Reports →</a>
      </div>
    </div>

    <!-- System Overview Section -->
    <div class="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-5">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div class="text-sm font-medium text-gray-600 mb-1">Total Jobs</div>
          <div class="text-2xl font-bold text-dryd-blue">{$jobStatusCounts?.total || 0}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium text-gray-600 mb-1">Active Quotes</div>
          <div class="text-2xl font-bold text-green-600">{$quoteStore?.quotes?.length || 0}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium text-gray-600 mb-1">Jobs On Hold</div>
          <div class="text-2xl font-bold text-yellow-600">{$jobStatusCounts?.ON_HOLD || 0}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium text-gray-600 mb-1">Invoiced Jobs</div>
          <div class="text-2xl font-bold text-purple-600">{$jobStatusCounts?.INVOICED || 0}</div>
        </div>
      </div>
    </div>
  </div>
</div> 