export const uiEn = {
  translation: {
    ui: {
      home: "Home",
      editProfile: "Edit Profile",
      notifications: "Notifications",
      settings: "Settings",
      logout: "Logout",
      success: "Success",
      error: "Error",
      workers: "Workers",
      searchWorkers: "Search Worker",
      available: "Available",
      unavailable: "Unavailable",
      createJob: "Create Job",
      login: {
        welcome: "Welcome to Hirovo",
        subtitle: "Please enter your email and password",
        emailPlaceholder: "Your email address",
        usernamePlaceholder: "Your username",
        passwordPlaceholder: "Your password",
        submit: "Login",
        forgotPassword: "Forgot Password",
        register: "Register"
      },
      signup: {
        title: "Create Account",
        name: "Name",
        surname: "Surname",
        phone: "Phone",
        password: "Password",
        enterName: "Enter your name",
        enterSurname: "Enter your surname",
        enterPhone: "Enter your phone number",
        enterPassword: "Enter your password",
        iAmA: "I am a...",
        worker: "Worker",
        employer: "Employer",
        submit: "Register",
        nameRequired: "Name is required",
        surnameRequired: "Surname is required",
        phoneInvalid: "Phone is not valid",
        passwordMin: "Password must be at least 6 characters",
        userInfoNotFound: "User information not found.",
        successTitle: "Registration Successful",
        successMessage: "Your account has been created!",
        errorTitle: "Error",
        errorMessage: "Account could not be created. Please try again."
      },
      jobs: {
        createTitle: "Create Job Posting",
        jobTitle: "Job Title",
        jobTitlePlaceholder: "e.g.: Senior Software Engineer",
        jobTitleRequired: "Job title is required.",
        jobType: "Job Type",
        jobTypePlaceholder: "Full-time, Part-time, Freelance",
        jobTypeRequired: "Job type is required.",
        location: "Location",
        locationPlaceholder: "Enter address or use your location",
        locationRequired: "Location is required.",
        locationError: "Location could not be obtained. Please enter manually.",
        getLocation: "Get Location",
        salary: "Salary",
        salaryPlaceholder: "e.g.: 75000",
        salaryRequired: "Salary is required and must be positive.",
        jobDescription: "Job Description",
        jobDescriptionPlaceholder: "Job responsibilities, requirements, etc.",
        jobDescriptionRequired: "Job description is required.",
        requiredSkills: "Required Skills",
        requiredSkillsPlaceholder: "e.g.: JavaScript, React",
        deadline: "Application Deadline",
        deadlinePlaceholder: "Select date",
        notificationRadius: "Notification Radius (km)",
        notificationRadiusPlaceholder: "1-100",
        notificationRadiusRequired: "Notification radius is required.",
        notificationRadiusMax: "Notification radius can be a maximum of 100 km.",
        submit: "Submit",
        successTitle: "Job Created",
        successMessage: "Job posting created successfully!",
        errorTitle: "Error",
        errorMessage: "Job could not be created. Please try again.",
        loadError: "Error occurred while loading jobs.",
        noJobs: "No jobs to display.",
        type: "Type",
        status: "Status",
        deleteTitle: "Delete Job Posting",
        deleteButton: "Delete",
        deleteSuccessTitle: "Deleted Successfully",
        deleteSuccessMessage: "Job posting deleted successfully.",
        updateTitle: "Update Job Posting",
        updateButton: "Update",
        updateSuccessTitle: "Updated Successfully",
        updateSuccessMessage: "Job posting updated successfully.",
        detailLoadError: "Job details could not be loaded.",
        notFound: "Job not found.",
        description: "Description",
        employerId: "Employer ID",
        feedTitle: "Job Postings",
        feedSubtitle: "Browse jobs around you",
        viewDetails: "View Details",
        applyNow: "Apply Now",
        detailTitle: "Job Details",
        createdSuccessfully: "Job posting created successfully.",
        createdError: "Job posting could not be created. Please try again.",
        createJobTitle: "Create Job Posting",
        title: "Job Posting Title",
        titlePlaceholder: "e.g.: Gardener Wanted",
        descriptionPlaceholder: "Enter job details...",
        notifyRadiusKm: 'Display Radius (km)',
        notifyRadiusExplanation: 'The job will be shown to users within this radius.',
        submitJob: "Submit Job",
        applicationSuccess: "Application successful",
        applicationSubmitted: "You have successfully applied for the job.",
        applicationError: "An error occurred during application",
        pleaseTryAgain: "Please try again.",
        cannotApply: "User information is missing for application."
      },
      profile: {
        title: "Edit Profile",
        phoneNumber: "Phone Number",
        birthDate: "Date of Birth",
        city: "City",
        district: "District",
        description: "Description",
        isAvailable: "I am available",
        save: "Save",
        updated: "Profile updated successfully",
        email: "Email",
        updateError: "Profile could not be updated. Please try again.",
      },
      form: {
        phoneNumber: "Phone Number",
        city: "City",
        district: "District",
        submit: "Save",
        success: "Profile updated successfully",
        phoneNumberPlaceholder: "e.g., +905...",
        birthDate: "Date of Birth",
        birthDatePlaceholder: "YYYY-MM-DD",
        cityPlaceholder: "e.g., Istanbul",
        districtPlaceholder: "e.g., Kadıköy",
        description: "Description",
        descriptionPlaceholder: "Tell us about yourself...",
        isAvailable: "I am available",
        save: "Save",
        emailPlaceholder: "Your email address",
      },
      validation: {
        required: "This field is required",
        phoneNumber: "Please enter a valid phone number",
        invalidDate: "Invalid date format",
      },
      workerProfileScreen: {
        title: "Worker Profile",
        description: "Description",
        phoneNumber: "Phone Number",
        hidden: "Hidden",
        visibleOnlyToEmployers: "Visible only to authorized employers.",
        birthDate: "Date of Birth",
        city: "City",
        district: "District",
        availabilityStatus: "Availability Status",
        contactWorker: "Contact Worker",
        detailError: "Worker details could not be loaded.",
        notFound: "Worker not found.",
        available: "Available",
        unavailable: "Unavailable",
      },
      ApplicationsScreen: {
        myApplications: "My Applications",
        title: "Applications",
        noApplications: "No applications to display.",
        loadError: "Error occurred while loading applications.",
        detailLoadError: "Application details could not be loaded.",
        notFound: "Application not found.",
        appliedDate: "Application Date",
        jobTitle: "Job Posting Title",
        salary: "Salary",
        jobType: "Job Type",
        status: "Status",
        statuses: {
          Pending: "Pending",
          Accepted: "Accepted",
          Rejected: "Rejected",
          Cancelled: "Cancelled",
        }
      }
    },
    error: {
      DEFAULT_ERROR: "An error occurred. Please try again.",
      TITLE: "Error",
    },
    jobType: {
      FullTime: "Full Time",
      PartTime: "Part Time",
      Freelance: "Freelance"
    },
    jobStatus: {
      Active: "Active",
      Closed: "Closed",
      Filled: "Filled"
    },
    common: {
      loading: "Loading...",
      cancel: "Cancel",
      save: "Save",
      editProfile: "Edit Profile",
      logout: "Logout"
    },
    tabs: {
      jobs: 'Job Postings',
      workers: 'Workers',
      applications: 'Applications',
    },
    validation: {
      required: "This field is required",
      phoneNumber: "Please enter a valid phone number",
      invalidDate: "Invalid date format"
    }
  }
};