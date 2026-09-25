using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MarketAdvanced.Catalog.Application.Abstractions;
using MarketAdvanced.Catalog.Application.Common.Products;
using MarketAdvanced.Catalog.Application.Commands.Products.CreateProduct;
using MarketAdvanced.Catalog.Application.Commands.Products.DeleteProduct;
using MarketAdvanced.Catalog.Application.Queries.Products.GetProduct;
using MarketAdvanced.Catalog.Application.Commands.Products.Images;
using MarketAdvanced.Catalog.Application.Queries.Products.SearchProducts;
using MarketAdvanced.Catalog.Application.Commands.Products.UpdateProduct;

namespace MarketAdvanced.Catalog.WebApi.Products;

[ApiController]
[Authorize]
[Route("api/admin/[controller]")]
public class ProductsController: ControllerBase
{
  private const long MaxImageSize = 10 * 1024 * 1024;

  private readonly IMediator _mediator;

  private readonly ICurrentUser _currentUser;

  public ProductsController(IMediator mediator, ICurrentUser currentUser)
  {
      _mediator = mediator;
      _currentUser = currentUser;
  }

  /// <summary>Список с фильтрами и пагинацией: { items, total }.</summary>
  [HttpGet]
  public async Task<IActionResult> list(
      [FromQuery] string? search,
      [FromQuery] int? categoryId,
      [FromQuery] int? brandId,
      [FromQuery] bool? isActive,
      [FromQuery] int page = 1,
      [FromQuery] int pageSize = 20,
      CancellationToken ct = default)
  {
      var query = new SearchProductsQuery(search, categoryId, brandId, isActive, Math.Max(page, 1), Math.Clamp(pageSize, 1, 100));
      return Ok(await _mediator.Send(query, ct));
  }

  [HttpGet("{id:int}")]
  public async Task<IActionResult> read(int id, CancellationToken ct)
  {
      return Ok(await _mediator.Send(new GetProductQuery(id), ct));
  }

  [HttpPost]
  public async Task<IActionResult> create([FromBody] ProductRequest request, CancellationToken ct)
  {
      var command = new CreateProductCommand(
          _currentUser.Id,
          request.Name,
          request.Slug,
          request.Description,
          request.CategoryId,
          request.BrandId,
          request.IsActive,
          ToVariantInputs(request.Variants),
          ToAttributeInputs(request.Attributes)
      );

      var result = await _mediator.Send(command, ct);
      return Ok(result);
  }

  [HttpPut("{id:int}")]
  public async Task<IActionResult> update(int id, [FromBody] ProductRequest request, CancellationToken ct)
  {
      var command = new UpdateProductCommand(
          id,
          request.Name,
          request.Slug,
          request.Description,
          request.CategoryId,
          request.BrandId,
          request.IsActive,
          ToVariantInputs(request.Variants),
          ToAttributeInputs(request.Attributes)
      );

      var result = await _mediator.Send(command, ct);
      return Ok(result);
  }

  [HttpDelete("{id:int}")]
  public async Task<IActionResult> delete(int id, CancellationToken ct)
  {
      await _mediator.Send(new DeleteProductCommand(id), ct);
      return NoContent();
  }

  /* ---------- фото: хендлеры пока заглушки, ждут S3 ---------- */

  [HttpPost("{id:int}/images")]
  [RequestSizeLimit(MaxImageSize)]
  public async Task<IActionResult> uploadImage(int id, IFormFile file, CancellationToken ct)
  {
      var uploaded = new UploadedFile(file.OpenReadStream(), file.FileName, file.ContentType);
      return Ok(await _mediator.Send(new UploadProductImageCommand(id, uploaded), ct));
  }

  [HttpDelete("{id:int}/images/{imageId:int}")]
  public async Task<IActionResult> deleteImage(int id, int imageId, CancellationToken ct)
  {
      await _mediator.Send(new DeleteProductImageCommand(id, imageId), ct);
      return NoContent();
  }

  [HttpPut("{id:int}/images/{imageId:int}/main")]
  public async Task<IActionResult> setMainImage(int id, int imageId, CancellationToken ct)
  {
      await _mediator.Send(new SetMainProductImageCommand(id, imageId), ct);
      return NoContent();
  }

  /* ---------- маппинг ---------- */

  private static List<VariantInput> ToVariantInputs(IEnumerable<ProductVariantRequest> variants) =>
      variants.Select(v => new VariantInput(
          v.Id,
          v.Sku.Trim(),
          v.Name?.Trim(),
          v.Price,
          v.Stock,
          v.IsActive,
          ToAttributeInputs(v.Attributes)
      )).ToList();

  private static List<AttributeValueInput> ToAttributeInputs(IEnumerable<AttributeValueRequest> attributes) =>
      attributes.Select(a => new AttributeValueInput(a.AttributeId, a.Value.Trim())).ToList();
}
