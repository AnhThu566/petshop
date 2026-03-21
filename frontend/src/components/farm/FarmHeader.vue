<template>
  <header class="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
    <h5 class="mb-0 text-success font-weight-bold d-flex align-items-center">
      <i class="fas fa-store-alt mr-2"></i> TRUNG TÂM QUẢN LÝ CỦA TRANG TRẠI
    </h5>

    <div class="user-profile d-flex align-items-center">
      <button class="btn btn-light rounded-circle mr-3 position-relative" title="Thông báo">
        <i class="fas fa-bell text-secondary"></i>
        <span class="position-absolute bg-danger rounded-circle" style="width: 8px; height: 8px; top: 5px; right: 5px;"></span>
      </button>
      <div class="d-flex align-items-center border-left pl-3">
        <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm" style="width: 35px; height: 35px;">
          <i class="fas fa-user"></i>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "FarmHeader"
};
</script>